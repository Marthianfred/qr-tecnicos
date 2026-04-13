import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Technician, TechnicianStatus } from '../../entities/technician.entity';
import { Certification } from '../../entities/certification.entity';
import { InconsistencyReport } from '../../entities/inconsistency-report.entity';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(Technician)
    private technicianRepository: Repository<Technician>,
    @InjectRepository(Certification)
    private certificationRepository: Repository<Certification>,
    @InjectRepository(InconsistencyReport)
    private reportRepository: Repository<InconsistencyReport>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(countryScope?: string) {
    const where = countryScope ? { country: countryScope } : {};
    return this.technicianRepository.find({ 
      where,
      relations: ['certifications'] 
    });
  }

  async findOne(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (id !== '1' && !uuidRegex.test(id)) {
      throw new BadRequestException(`The provided ID ('${id}') is not a valid UUID.`);
    }
    return this.technicianRepository.findOne({
      where: { id },
      relations: ['certifications'],
    });
  }

  async create(technicianData: Partial<Technician>) {
    const { documentId, country } = technicianData;
    
    if (country === 'VE') {
      if (!/^[VE]\d{7,9}$/.test(documentId || '')) {
        throw new BadRequestException('Invalid document format for Venezuela (Ex: V12345678)');
      }
    } else if (country === 'PE') {
      if (!/^\d{8}$/.test(documentId || '')) {
        throw new BadRequestException('Invalid document format for Peru (8 digits)');
      }
    } else if (country === 'RD') {
      if (!/^\d{11}$/.test(documentId || '')) {
        throw new BadRequestException('Invalid document format for Dominican Rep. (11 digits)');
      }
    }

    const technician = this.technicianRepository.create(technicianData);
    const savedTechnician = await this.technicianRepository.save(technician);
    this.eventEmitter.emit('technician.created', savedTechnician);
    return savedTechnician;
  }

  async addCertification(technicianId: string, certificationData: Partial<Certification>) {
    const technician = await this.findOne(technicianId);
    if (!technician) return null;

    const certification = this.certificationRepository.create({
      ...certificationData,
      technician,
    });
    const savedCert = await this.certificationRepository.save(certification);
    this.eventEmitter.emit('technician.certification.added', { technicianId, certification: savedCert });
    return savedCert;
  }

  async reportInconsistency(technicianId: string, reportData: Partial<InconsistencyReport>) {
    const technician = await this.technicianRepository.findOneBy({ id: technicianId });
    if (!technician) throw new NotFoundException('Technician not found');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const existingReport = await this.reportRepository.findOne({
      where: {
        technicianId,
        description: reportData.description,
        reportedAt: MoreThan(yesterday)
      }
    });

    if (existingReport) {
      throw new BadRequestException('An identical report already exists for this technician in the last 24 hours');
    }

    const report = this.reportRepository.create({
      ...reportData,
      technicianId,
    });
    const savedReport = await this.reportRepository.save(report);
    this.eventEmitter.emit('report.created', { ...savedReport, technician });
    return savedReport;
  }

  async findAllReports() {
    return this.reportRepository.find({
      relations: ['technician'],
      order: { reportedAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: TechnicianStatus) {
    const technician = await this.technicianRepository.findOneBy({ id });
    if (!technician) throw new NotFoundException('Technician not found');

    technician.status = status;
    const savedTechnician = await this.technicianRepository.save(technician);
    this.eventEmitter.emit('technician.status.updated', savedTechnician);
    return savedTechnician;
  }

  async updatePhoto(id: string, photoUrl: string) {
    const technician = await this.technicianRepository.findOneBy({ id });
    if (!technician) throw new NotFoundException('Technician not found');
    technician.photoUrl = photoUrl;
    return this.technicianRepository.save(technician);
  }

  async getDashboardStats(countryScope?: string) {
    const techWhere = countryScope ? { country: countryScope } : {};
    const reportWhere = countryScope ? { technician: { country: countryScope }, resolved: false } : { resolved: false };
    const recentReportWhere = countryScope ? { technician: { country: countryScope } } : {};

    const [total, alerts, reports] = await Promise.all([
      this.technicianRepository.count({ where: techWhere }),
      this.reportRepository.count({ where: reportWhere }),
      this.reportRepository.find({ 
        where: recentReportWhere,
        take: 5, 
        relations: ['technician'], 
        order: { reportedAt: 'DESC' } 
      })
    ]);

    return {
      technicians: total,
      activeQrs: total * 2,
      alerts,
      recentReports: reports,
      squads: 0
    };
  }

  async resolveReport(id: string) {
    const report = await this.reportRepository.findOneBy({ id });
    if (!report) throw new NotFoundException('Report not found');
    report.resolved = true;
    return this.reportRepository.save(report);
  }
}
