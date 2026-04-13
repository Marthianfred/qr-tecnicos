import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import { Company } from '../../entities/company.entity';
import { User, UserRole } from '../../entities/user.entity';
import { Squad } from '../../entities/squad.entity';
import { Technician, TechnicianStatus, StaffType } from '../../entities/technician.entity';
import { Certification, CertificationLevel } from '../../entities/certification.entity';
import { DepartmentsService } from '../departamentos/departamentos.service';
import { Department } from '../../entities/department.entity';

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Squad)
    private squadRepository: Repository<Squad>,
    @InjectRepository(Technician)
    private technicianRepository: Repository<Technician>,
    @InjectRepository(Certification)
    private certificationRepository: Repository<Certification>,
    private departmentsService: DepartmentsService,
  ) {}

  async processCsv(filePath: string, paisScope?: string, skipRows: number = 3, dryRun: boolean = false) {
    this.logger.log(`${dryRun ? '[PREVIEW]' : '[INGEST]'} ETL process for file: ${filePath} with Scope: ${paisScope || 'GLOBAL'}`);
    const isXlsx = filePath.toLowerCase().endsWith('.xlsx');
    
    
    const fileName = path.basename(filePath).toLowerCase();
    let staffType = StaffType.PARTNER;
    
    if (fileName.includes('interno')) {
      staffType = StaffType.CORPORATE;
    } else if (fileName.includes('aliado') || fileName.includes('comercial')) {
      staffType = StaffType.PARTNER;
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

      return await this.ingestData(dataRows, staffType, paisScope, dryRun);
    } finally {
      if (fs.existsSync(filePath) && filePath.includes('uploads')) {
        fs.unlinkSync(filePath);
      }
    }
  }

  private async extractXlsxRows(filePath: string, skipRows: number): Promise<string[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error('Worksheet not found in Excel');

    const dataRows: string[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= skipRows + 1) return;
      const values = row.values as any[];
      const rowData = values.slice(1).map(v => (v?.toString() || '').replace(/,/g, ' ')).join(',');
      dataRows.push(rowData);
    });
    return dataRows;
  }

  private async ingestData(dataLines: string[], defaultStaffType: StaffType, paisScope?: string, dryRun: boolean = false) {
    const supervisorsMap = new Map<string, User>();
    const previewData = [];

    
    for (const line of dataLines) {
      const parts = line.split(',');
      const companyName = parts[4]?.trim();
      const taxId = parts[5]?.trim(); 
      const name = parts[6]?.trim();
      const role = parts[8]?.trim(); 
      const documentId = parts[7]?.trim();

      if (role === 'Supervisor' && !dryRun) {
        let company = await this.companyRepository.findOneBy({ taxId });
        if (!company) {
          company = this.companyRepository.create({ name: companyName, taxId, country: paisScope || 'VE' });
          company = await this.companyRepository.save(company);
        }

        let user = await this.userRepository.findOneBy({ username: documentId });
        if (!user) {
          user = this.userRepository.create({
            username: documentId,
            password: 'password123', 
            role: UserRole.COORDINATOR,
            isActive: true,
            paisScope: paisScope || null,
          });
          user = await this.userRepository.save(user);
        }
        supervisorsMap.set(name, user);
      }
    }

    
    for (const line of dataLines) {
      const parts = line.split(',');
      if (parts.length < 5) continue;

      const zoneExcel = parts[2]?.trim() || 'General';
      const companyName = parts[4]?.trim() || 'Fibex';
      const taxId = parts[5]?.trim() || 'N/A';
      const name = parts[6]?.trim();
      const documentId = parts[7]?.trim();
      const role = parts[8]?.trim() || 'Field Technician';
      const departmentName = parts[9]?.trim() || 'General';
      const statusExcel = parts[22]?.trim(); 
      const countryFinal = paisScope || (documentId?.startsWith('V') ? 'VE' : (documentId?.length === 11 ? 'RD' : 'PE'));
      const statusFinal = statusExcel === 'INACTIVO' ? TechnicianStatus.INACTIVE : TechnicianStatus.ACTIVE;

      if (dryRun) {
        previewData.push({
          name,
          documentId,
          role,
          country: countryFinal,
          zone: zoneExcel,
          company: companyName,
          department: departmentName
        });
        continue;
      }
      
      const stype = parts[0]?.trim().toLowerCase().includes('fibex') 
        ? StaffType.CORPORATE 
        : defaultStaffType;
      
      const inicial = parts[8]?.trim();
      const basico = parts[10]?.trim();
      const integral = parts[12]?.trim();
      const premium = parts[14]?.trim();

      
      await this.departmentsService.ensureDefaultDepartments([departmentName]);
      const departmentObj = await this.departmentsService.findByName(departmentName);

      
      let companyObj = await this.companyRepository.findOneBy({ taxId });
      if (!companyObj) {
        companyObj = this.companyRepository.create({
          name: companyName,
          taxId: taxId,
          country: countryFinal,
        });
        companyObj = await this.companyRepository.save(companyObj);
      }

      let tech = await this.technicianRepository.findOneBy({ documentId });
      if (!tech) {
        tech = this.technicianRepository.create({
          name: name,
          documentId: documentId,
          role: role,
          staffType: stype,
          country: countryFinal,
          zone: zoneExcel,
          status: statusFinal,
          department: departmentObj,
        });
        tech = await this.technicianRepository.save(tech);
      }

      const certsToLoad = [
        { level: CertificationLevel.INITIAL, status: inicial },
        { level: CertificationLevel.BASIC, status: basico },
        { level: CertificationLevel.INTEGRAL, status: integral },
        { level: CertificationLevel.PREMIUM, status: premium },
      ];

      for (const certData of certsToLoad) {
        if (certData.status === 'Certificado') {
          const exists = await this.certificationRepository.findOne({
            where: { technician: { id: tech.id }, level: certData.level }
          });

          if (!exists) {
            const cert = this.certificationRepository.create({
              level: certData.level,
              issuedAt: new Date(),
              technician: tech,
            });
            await this.certificationRepository.save(cert);
          }
        }
      }
    } 
  
    if (dryRun) {
      return { success: true, preview: previewData, total: previewData.length };
    }
    return { success: true, processed: dataLines.length };
  }
}
