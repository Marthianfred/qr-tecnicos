import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { Empresa } from '../../entities/empresa.entity';
import { User, UserRole } from '../../entities/user.entity';
import { Cuadrilla } from '../../entities/cuadrilla.entity';
import { Tecnico, TecnicoStatus } from '../../entities/tecnico.entity';
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

  async processCsv(filePath: string, skipRows: number = 3) {
    this.logger.log(`Starting ETL process for file: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // 1. Limpieza Inicial
    const dataLines = lines.slice(skipRows + 1); // +1 to skip header
    const header = lines[skipRows].split(',');
    
    this.logger.log(`Processing ${dataLines.length} data rows`);

    // We'll process in two passes: 
    // Pass 1: Empresas and Supervisors (Coordinadores)
    // Pass 2: Tecnicos linked to Supervisors

    // Map to store created supervisors to link them to technicians
    const supervisorsMap = new Map<string, User>();
    // Map to store created cuadrillas by supervisor name
    const cuadrillasMap = new Map<string, Cuadrilla>();

    // Pass 1: Empresas and Supervisors
    for (const line of dataLines) {
      const parts = line.split(',');
      const empresaNombre = parts[0];
      const nil = parts[1];
      const nombre = parts[2];
      const rol = parts[3];
      const documento = parts[4];

      if (rol === 'Supervisor') {
        // 2. Creación de Empresas
        let empresa = await this.empresaRepository.findOneBy({ nil });
        if (!empresa) {
          empresa = this.empresaRepository.create({ nombre: empresaNombre, nil });
          empresa = await this.empresaRepository.save(empresa);
          this.logger.log(`Created Empresa: ${empresaNombre}`);
        }

        // Create Supervisor (User)
        let user = await this.userRepository.findOneBy({ username: documento });
        if (!user) {
          user = this.userRepository.create({
            username: documento,
            password: 'password123', // Default password
            role: UserRole.COORDINATOR,
            isActive: true,
          });
          user = await this.userRepository.save(user);
          this.logger.log(`Created Supervisor User: ${nombre}`);
        }
        supervisorsMap.set(nombre, user);

        // Create Cuadrilla for this supervisor
        let cuadrilla = await this.cuadrillaRepository.findOneBy({ supervisorId: user.id });
        if (!cuadrilla) {
          cuadrilla = this.cuadrillaRepository.create({
            nombre: `Cuadrilla ${nombre}`,
            zona: 'General',
            supervisor: user,
            empresa: empresa,
          });
          cuadrilla = await this.cuadrillaRepository.save(cuadrilla);
          this.logger.log(`Created Cuadrilla for ${nombre}`);
        }
        cuadrillasMap.set(nombre, cuadrilla);
      }
    }

    // Pass 2: Tecnicos and Certificaciones
    for (const line of dataLines) {
      const parts = line.split(',');
      const empresaNombre = parts[0];
      const nil = parts[1];
      const nombre = parts[2];
      const rol = parts[3];
      const documento = parts[4];
      const inicial = parts[5];
      const basico = parts[6];
      const integral = parts[7];
      const premium = parts[8];
      const supervisorNombre = parts[9]?.trim();

      if (rol === 'Tecnico') {
        // 3. Carga Jerárquica de Personal
        const cuadrilla = cuadrillasMap.get(supervisorNombre);
        if (!cuadrilla) {
          this.logger.warn(`Supervisor ${supervisorNombre} not found for tecnico ${nombre}. Skipping or handle accordingly.`);
          // For now, we continue if no supervisor is found, or we could link to a default one
        }

        let tecnico = await this.tecnicoRepository.findOneBy({ documento });
        if (!tecnico) {
          tecnico = this.tecnicoRepository.create({
            nombre: nombre,
            documento: documento,
            pais: documento.startsWith('V') ? 'VE' : 'PE', // Simple heuristic
            status: TecnicoStatus.ACTIVO,
            cuadrilla: cuadrilla,
          });
          tecnico = await this.tecnicoRepository.save(tecnico);
          this.logger.log(`Created Tecnico: ${nombre}`);
        }

        // 4. Pivoteo de Certificaciones
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

    this.logger.log('ETL process completed successfully');
    return { success: true };
  }
}
