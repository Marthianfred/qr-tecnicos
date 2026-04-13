import { Controller, Get, Post, Body, Param, Patch, UseGuards, Sse, MessageEvent, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';
import { TechniciansService } from './technicians.service';
import { AuthService } from '../auth/auth.service';
import { Technician, TechnicianStatus } from '../../entities/technician.entity';
import { Certification } from '../../entities/certification.entity';
import { InconsistencyReport } from '../../entities/inconsistency-report.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('technicians')
export class TechniciansController {
  constructor(
    private readonly techniciansService: TechniciansService,
    private readonly authService: AuthService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Sse('events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  events(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, '*').pipe(
      map((payload: any) => ({
        data: payload,
        type: 'message'
      }) as MessageEvent),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findAll(@Req() req: any) {
    return this.techniciansService.findAll(req.user.countryScope);
  }

  @Get('inconsistency-reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findAllReports() {
    return this.techniciansService.findAllReports();
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  async getDashboardStats(@Req() req: any) {
    return this.techniciansService.getDashboardStats(req.user.countryScope);
  }

  @Get('validations/:token')
  validateToken(@Param('token') token: string) {
    return this.authService.validateToken(token);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TECHNICIAN)
  findOne(@Param('id') id: string) {
    return this.techniciansService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() technicianData: Partial<Technician>) {
    return this.techniciansService.create(technicianData);
  }

  @Patch(':id/foto')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/fotos',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadPhoto(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Se requiere una imagen para el carnet');
    const fotoUrl = `/uploads/fotos/${file.filename}`;
    return this.techniciansService.updatePhoto(id, fotoUrl);
  }

  @Post(':id/qr-codes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN, UserRole.COORDINATOR)
  generateQR(@Param('id') id: string) {
    return this.authService.generateQR(id);
  }

  @Post(':id/certifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  addCertification(
    @Param('id') id: string,
    @Body() certificationData: Partial<Certification>,
  ) {
    return this.techniciansService.addCertification(id, certificationData);
  }

  @Post(':id/inconsistency-reports')
  reportInconsistency(
    @Param('id') id: string,
    @Body() reportData: Partial<InconsistencyReport>,
  ) {
    return this.techniciansService.reportInconsistency(id, reportData);
  }

  @Patch('inconsistency-reports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  resolveReport(@Param('id') id: string) {
    return this.techniciansService.resolveReport(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  async updateStatus(@Param('id') id: string, @Body('status') status: TechnicianStatus) {
    return this.techniciansService.updateStatus(id, status);
  }
}
