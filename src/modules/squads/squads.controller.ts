import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SquadsService } from './cuadrillas.service';
import { Squad } from '../../entities/squad.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('squads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SquadsController {
  constructor(private readonly cuadrillasService: SquadsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() cuadrillaData: Partial<Squad>) {
    return this.cuadrillasService.create(cuadrillaData);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findAll() {
    return this.cuadrillasService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findOne(@Param('id') id: string) {
    return this.cuadrillasService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() cuadrillaData: Partial<Squad>) {
    return this.cuadrillasService.update(id, cuadrillaData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string) {
    return this.cuadrillasService.remove(id);
  }

  @Post(':id/tecnicos')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  addTechnicians(@Param('id') id: string, @Body('tecnicoIds') tecnicoIds: string[]) {
    return this.cuadrillasService.addTechnicians(id, tecnicoIds);
  }

  @Delete(':id/tecnicos/:tecnicoId')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  removeTechnician(@Param('id') id: string, @Param('tecnicoId') tecnicoId: string) {
    return this.cuadrillasService.removeTechnician(id, tecnicoId);
  }
}
