import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import { Empresa } from '../../entities/empresa.entity';
import { User, UserRole } from '../../entities/user.entity';
import { Cuadrilla } from '../../entities/cuadrilla.entity';
import { Tecnico, TecnicoStatus, TipoPersonal } from '../../entities/tecnico.entity';
import { Certificacion, NivelCertificacion } from '../../entities/certificacion.entity';
import { DepartamentosService } from '../departamentos/departamentos.service';
import { Departamento } from '../../entities/departamento.entity';

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Cuadrilla)
    private cuadrillaRepository: Repository<Cuadrilla>,
    @InjectRepository(Tecnico)
    private tecnicoRepository: Repository<Tecnico>,
    @InjectRepository(Certificacion)
    private certificacionRepository: Repository<Certificacion>,
    private departamentosService: DepartamentosService,
  ) {}

  async processCsv(filePath: string, paisScope?: string, skipRows: number = 3, dryRun: boolean = false) {
    this.logger.log(`${dryRun ? '[PREVIEW]' : '[INGEST]'} ETL process for file: ${filePath} with Scope: ${paisScope || 'GLOBAL'}`);
    const isXlsx = filePath.toLowerCase().endsWith('.xlsx');
    
    // Determinar categoría por nombre de archivo
    const fileName = path.basename(filePath).toLowerCase();
    let tipoPersonalAutomatico = TipoPersonal.ALIADO;
    
    if (fileName.includes('interno')) {
      tipoPersonalAutomatico = TipoPersonal.CORPORATIVO;
    } else if (fileName.includes('aliado') || fileName.includes('comercial')) {
      tipoPersonalAutomatico = TipoPersonal.ALIADO;
    }

    try {
      let dataRows: string[] = [];
      if (isXlsx) {
        dataRows = await this.extractXlsxRows(filePath, skipRows);
      } else {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        dataRows = lines.slice(skipRows + 1);
      }

      return await this.ingestData(dataRows, tipoPersonalAutomatico, paisScope, dryRun);
    } finally {
      // Solo borramos si NO es dryRun o si decidimos persistir el preview en memoria (aquí lo borramos siempre tras procesar)
      if (fs.existsSync(filePath) && filePath.includes('uploads')) {
        fs.unlinkSync(filePath);
      }
    }
  }

  private async extractXlsxRows(filePath: string, skipRows: number): Promise<string[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error('No se encontró la hoja de trabajo en el Excel');

    const dataRows: string[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= skipRows + 1) return;
      const values = row.values as any[];
      const rowData = values.slice(1).map(v => (v?.toString() || '').replace(/,/g, ' ')).join(',');
      dataRows.push(rowData);
    });
    return dataRows;
  }

  private async processXlsx(filePath: string, defaultTipo: TipoPersonal, skipRows: number, paisScope?: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error('No se encontró la hoja de trabajo en el Excel');

    const dataRows: string[] = [];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= skipRows + 1) return; // Skip headers
      
      // Convertir fila de Excel a string separado por comas para reusar el ingestData
      const values = row.values as any[];
      // ExcelJS starts at index 1 for columns
      const rowData = values.slice(1).map(v => (v?.toString() || '').replace(/,/g, ' ')).join(',');
      dataRows.push(rowData);
    });

    // Manejar imágenes si es el archivo de COUNET
    if (filePath.toLowerCase().includes('counet')) {
      await this.extractImages(workbook, filePath);
    }

    this.logger.log(`Processing ${dataRows.length} XLSX rows with Scope: ${paisScope || 'GLOBAL'}`);
    return await this.ingestData(dataRows, defaultTipo, paisScope);
  }

  private async extractImages(workbook: ExcelJS.Workbook, filePath: string) {
    this.logger.log('Iniciando extracción de imágenes del Excel de COUNET...');
    // Lógica para extraer imágenes y guardarlas en /uploads/fotos
  }

  private async ingestData(dataLines: string[], tipoDefault: TipoPersonal, paisScope?: string, dryRun: boolean = false) {
    const supervisorsMap = new Map<string, User>();
    const cuadrillasMap = new Map<string, Cuadrilla>();
    const previewData = [];

    // Pass 1: Identificar Empresas y Supervisores
    for (const line of dataLines) {
      const parts = line.split(',');
      const zonaExcel = parts[2]?.trim();
      const empresaNombre = parts[4]?.trim();
      const nil = parts[5]?.trim(); 
      const nombre = parts[6]?.trim();
      const rol = parts[8]?.trim(); 
      const documento = parts[7]?.trim();

      if (rol === 'Supervisor') {
        let empresa = null;
        if (!dryRun) {
           empresa = await this.empresaRepository.findOneBy({ nil });
           if (!empresa) {
             empresa = this.empresaRepository.create({ nombre: empresaNombre, nil, pais: paisScope || 'VE' });
             empresa = await this.empresaRepository.save(empresa);
           }
        }

        let user = null;
        if (!dryRun) {
           user = await this.userRepository.findOneBy({ username: documento });
           if (!user) {
             user = this.userRepository.create({
               username: documento,
               password: 'password123', 
               role: UserRole.COORDINATOR,
               isActive: true,
               paisScope: paisScope || null,
             });
             user = await this.userRepository.save(user);
           }
           supervisorsMap.set(nombre, user);
        }
      }
    }

    // Pass 2: Identificar Técnicos
    for (const line of dataLines) {
      const parts = line.split(',');
      if (parts.length < 5) continue;

      const zonaExcel = parts[2]?.trim() || 'General';
      const nombre = parts[6]?.trim();
      const documento = parts[7]?.trim();
      const cargo = parts[8]?.trim() || 'Técnico de Campo';
      const departamentoNombre = parts[9]?.trim() || 'General';
      const statusExcel = parts[18]?.trim(); // Columna "PERSONAL" (S)
      const paisFinal = paisScope || (documento?.startsWith('V') ? 'VE' : (documento?.length === 11 ? 'RD' : 'PE'));
      const statusFinal = statusExcel === 'INACTIVO' ? TecnicoStatus.INACTIVO : TecnicoStatus.ACTIVO;

      if (dryRun) {
        previewData.push({
          nombre,
          documento,
          cargo,
          pais: paisFinal,
          zona: zonaExcel,
          empresa: parts[4]?.trim() || 'Fibex',
          departamento: departamentoNombre
        });
        continue;
      }
      
      // Priorizar el tipoDefault (calculado por nombre de archivo) pero validar con el nombre de empresa
      const tipoPers = parts[0]?.trim().toLowerCase().includes('fibex') 
        ? TipoPersonal.CORPORATIVO 
        : tipoDefault;
      
      const inicial = parts[8]?.trim();
      const basico = parts[10]?.trim();
      const integral = parts[12]?.trim();
      const premium = parts[14]?.trim();

      // Resolver Departamento relacional
      await this.departamentosService.ensureDefaultDepartments([departamentoNombre]);
      const departamentoObj = await this.departamentosService.findByNombre(departamentoNombre);

      // En un flujo real, aquí buscaríamos la cuadrilla si es necesario
      let tecnico = await this.tecnicoRepository.findOneBy({ documento });
      if (!tecnico) {
        tecnico = this.tecnicoRepository.create({
          nombre: nombre,
          documento: documento,
          cargo: cargo,
          tipoPersonal: tipoPers,
          pais: paisFinal,
          zona: zonaExcel,
          status: statusFinal,
          departamento: departamentoObj,
        });
        tecnico = await this.tecnicoRepository.save(tecnico);
        this.logger.log(`Importado ${cargo}: ${nombre} (${tipoPers}) en Departamento: ${departamentoNombre}`);
      }

        const certsToLoad = [
          { nivel: NivelCertificacion.INICIAL, status: inicial },
          { nivel: NivelCertificacion.BASICO, status: basico },
          { nivel: NivelCertificacion.INTEGRAL, status: integral },
          { nivel: NivelCertificacion.PREMIUM, status: premium },
        ];

        for (const certData of certsToLoad) {
          if (certData.status === 'Certificado') {
            const exists = await this.certificacionRepository.findOne({
              where: { tecnico: { id: tecnico.id }, nivel: certData.nivel }
            });

            if (!exists) {
              const cert = this.certificacionRepository.create({
                nivel: certData.nivel,
                fechaEmision: new Date(),
                tecnico: tecnico,
              });
              await this.certificacionRepository.save(cert);
            }
          }
        } // End certs loop
      } // End dataLines loop
  
      if (dryRun) {
        return { success: true, preview: previewData, total: previewData.length };
      }
  
      return { success: true, processed: dataLines.length };
    }
}
