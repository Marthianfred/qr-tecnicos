import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CuadrillasService } from './cuadrillas.service';
import { Cuadrilla } from '../../entities/cuadrilla.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('api/cuadrillas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CuadrillasController {
  constructor(private readonly cuadrillasService: CuadrillasService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() cuadrillaData: Partial<Cuadrilla>) {
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
  update(@Param('id') id: string, @Body() cuadrillaData: Partial<Cuadrilla>) {
    return this.cuadrillasService.update(id, cuadrillaData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string) {
    return this.cuadrillasService.remove(id);
  }

  @Post(':id/tecnicos')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  addTecnicos(@Param('id') id: string, @Body('tecnicoIds') tecnicoIds: string[]) {
    return this.cuadrillasService.addTecnicos(id, tecnicoIds);
  }

  @Delete(':id/tecnicos/:tecnicoId')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  removeTecnico(@Param('id') id: string, @Param('tecnicoId') tecnicoId: string) {
    return this.cuadrillasService.removeTecnico(id, tecnicoId);
  }
}
