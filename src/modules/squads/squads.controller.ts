import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SquadsService } from './squads.service';
import { Squad } from '../../entities/squad.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('squads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SquadsController {
  constructor(private readonly squadsService: SquadsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() squadData: Partial<Squad>) {
    return this.squadsService.create(squadData);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findAll() {
    return this.squadsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findOne(@Param('id') id: string) {
    return this.squadsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() squadData: Partial<Squad>) {
    return this.squadsService.update(id, squadData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string) {
    return this.squadsService.remove(id);
  }

  @Post(':id/technicians')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  addTechnicians(@Param('id') id: string, @Body('technicianIds') technicianIds: string[]) {
    return this.squadsService.addTechnicians(id, technicianIds);
  }

  @Delete(':id/technicians/:technicianId')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  removeTechnician(@Param('id') id: string, @Param('technicianId') technicianId: string) {
    return this.squadsService.removeTechnician(id, technicianId);
  }
}
