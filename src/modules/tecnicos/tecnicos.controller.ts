import { Controller, Get, Post, Body, Param, Patch, UseGuards, Sse, MessageEvent } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';
import { TecnicosService } from './tecnicos.service';
import { AuthService } from '../auth/auth.service';
import { Tecnico, TecnicoStatus } from '../../entities/tecnico.entity';
import { Certificacion } from '../../entities/certificacion.entity';
import { ReporteInconsistencia } from '../../entities/reporte-inconsistencia.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('tecnicos')
export class TecnicosController {
  constructor(
    private readonly tecnicosService: TecnicosService,
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
  findAll() {
    return this.tecnicosService.findAll();
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findAllReports() {
    return this.tecnicosService.findAllReports();
  }

  @Get('validate/:token')
  validateToken(@Param('token') token: string) {
    // Público para que los clientes puedan validar el QR
    return this.authService.validateToken(token);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TECHNICIAN)
  findOne(@Param('id') id: string) {
    return this.tecnicosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() tecnicoData: Partial<Tecnico>) {
    return this.tecnicosService.create(tecnicoData);
  }

  @Post(':id/qr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN, UserRole.COORDINATOR)
  generateQR(@Param('id') id: string) {
    return this.authService.generateQR(id);
  }

  @Post(':id/certificaciones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  addCertificacion(
    @Param('id') id: string,
    @Body() certificacionData: Partial<Certificacion>,
  ) {
    return this.tecnicosService.addCertificacion(id, certificacionData);
  }

  @Post(':id/report')
  reportInconsistency(
    @Param('id') id: string,
    @Body() reportData: Partial<ReporteInconsistencia>,
  ) {
    // Público o accesible por clientes? Según HU-5 el Cliente reporta.
    return this.tecnicosService.reportInconsistency(id, reportData);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TecnicoStatus,
  ) {
    return this.tecnicosService.updateStatus(id, status);
  }
}
