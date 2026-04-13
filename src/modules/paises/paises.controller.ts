import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { PaisesService } from './paises.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('paises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaisesController {
  constructor(private readonly paisesService: PaisesService) {}

  @Get()
  findAll() {
    return this.paisesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paisesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() paisData: any) {
    return this.paisesService.create(paisData);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() paisData: any) {
    return this.paisesService.update(id, paisData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.paisesService.remove(id);
  }
}
