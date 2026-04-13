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
  ) {}

  async processCsv(filePath: string, paisScope?: string, skipRows: number = 3) {
    this.logger.log(`Starting ETL process for file: ${filePath} with Scope: ${paisScope || 'GLOBAL'}`);
    const isXlsx = filePath.toLowerCase().endsWith('.xlsx');
    
    // Determinar categoría por nombre de archivo
    const fileName = path.basename(filePath).toLowerCase();
    let tipoPersonalAutomatico = TipoPersonal.ALIADO;
    
    if (fileName.includes('interno')) {
      tipoPersonalAutomatico = TipoPersonal.CORPORATIVO;
    } else if (fileName.includes('aliado') || fileName.includes('comercial')) {
      tipoPersonalAutomatico = TipoPersonal.ALIADO;
    } else if (fileName.includes('contratista')) {
      tipoPersonalAutomatico = TipoPersonal.ALIADO;
    }

    try {
      if (isXlsx) {
        return await this.processXlsx(filePath, tipoPersonalAutomatico, skipRows, paisScope);
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      const dataLines = lines.slice(skipRows + 1); 
      
      this.logger.log(`Processing ${dataLines.length} CSV rows`);
      return await this.ingestData(dataLines, tipoPersonalAutomatico, paisScope);
    } finally {
      if (fs.existsSync(filePath) && filePath.includes('uploads')) {
        fs.unlinkSync(filePath);
        this.logger.log(`Deleted temporary file: ${filePath}`);
      }
    }
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

  private async ingestData(dataLines: string[], tipoDefault: TipoPersonal, paisScope?: string) {
    // Map to store created supervisors to link them to technicians
    const supervisorsMap = new Map<string, User>();
    const cuadrillasMap = new Map<string, Cuadrilla>();

    // Pass 1: Empresas and Supervisors
    for (const line of dataLines) {
      const parts = line.split(',');
      const empresaNombre = parts[0]?.trim();
      const nil = parts[1]?.trim();
      const nombre = parts[2]?.trim();
      const rol = parts[3]?.trim();
      const documento = parts[4]?.trim();

      if (rol === 'Supervisor') {
        let empresa = await this.empresaRepository.findOneBy({ nil });
        if (!empresa) {
          empresa = this.empresaRepository.create({ nombre: empresaNombre, nil, pais: paisScope || 'VE' });
          empresa = await this.empresaRepository.save(empresa);
        }

        let user = await this.userRepository.findOneBy({ username: documento });
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

        let cuadrilla = await this.cuadrillaRepository.findOne({ where: { supervisor: { id: user.id } } });
        if (!cuadrilla) {
          cuadrilla = this.cuadrillaRepository.create({
            nombre: `Cuadrilla ${nombre}`,
            zona: parts[10]?.trim() || 'General',
            supervisor: user,
            empresa: empresa,
          });
          cuadrilla = await this.cuadrillaRepository.save(cuadrilla);
        }
        cuadrillasMap.set(nombre, cuadrilla);
      }
    }

    // Pass 2: Tecnicos and Certificaciones
    for (const line of dataLines) {
      const parts = line.split(',');
      const empresaNombre = parts[0]?.trim() || '';
      const nombre = parts[2]?.trim();
      const rol = parts[3]?.trim();
      const documento = parts[4]?.trim();
      
      const cargo = rol === 'Supervisor' ? 'Coordinador de Operaciones' : 'Técnico de Campo';
      // Priorizar el tipoDefault (calculado por nombre de archivo) pero validar con el nombre de empresa
      const tipoPers = empresaNombre.toLowerCase().includes('fibex') 
        ? TipoPersonal.CORPORATIVO 
        : tipoDefault;
      
      const inicial = parts[5]?.trim();
      const basico = parts[6]?.trim();
      const integral = parts[7]?.trim();
      const premium = parts[8]?.trim();
      const supervisorNombre = parts[9]?.trim();

      if (rol === 'Tecnico' || rol === 'Supervisor') {
        const cuadrilla = cuadrillasMap.get(supervisorNombre);

        let tecnico = await this.tecnicoRepository.findOneBy({ documento });
        if (!tecnico) {
          tecnico = this.tecnicoRepository.create({
            nombre: nombre,
            documento: documento,
            cargo: cargo,
            tipoPersonal: tipoPers,
            pais: paisScope || (documento.startsWith('V') ? 'VE' : (documento.length === 11 ? 'RD' : 'PE')),
            zona: parts[10]?.trim() || 'General',
            status: TecnicoStatus.ACTIVO,
            cuadrilla: cuadrilla,
          });
          tecnico = await this.tecnicoRepository.save(tecnico);
          this.logger.log(`Importado ${rol}: ${nombre} (${tipoPers}) en Zona: ${tecnico.zona}`);
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
        }
      }
    }

    return { success: true, processed: dataLines.length };
  }
}
