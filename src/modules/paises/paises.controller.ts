import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { CountryesService } from './paises.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('countries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CountryesController {
  constructor(private readonly paisesService: CountryesService) {}

  @Get()
  findAll() {
    return this.countryesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countryesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() paisData: any) {
    return this.countryesService.create(paisData);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() paisData: any) {
    return this.countryesService.update(id, paisData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.countryesService.remove(id);
  }
}
