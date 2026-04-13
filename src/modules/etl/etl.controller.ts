import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Req, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EtlService } from './etl.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('bulk-loads')
export class EtlController {
  constructor(private readonly etlService: EtlService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadFile(@UploadedFile() file: any, @Req() req: any, @Query('scope') scopeOverride?: string) {
    if (!file) throw new BadRequestException('Se requiere un archivo para la importación');
    const finalScope = scopeOverride && scopeOverride !== 'TODOS' ? scopeOverride : (req.user?.countryScope || 'GLOBAL');
    return this.etlService.processCsv(file.path, finalScope, 3, false);
  }

  @Post('simulation')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = 'simulacion_' + Array(16).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async previewFile(@UploadedFile() file: any, @Req() req: any, @Query('scope') scopeOverride?: string) {
    if (!file) throw new BadRequestException('Se requiere un archivo para la simulación');
    const finalScope = scopeOverride && scopeOverride !== 'TODOS' ? scopeOverride : (req.user?.countryScope || 'GLOBAL');
    return this.etlService.processCsv(file.path, finalScope, 3, true);
  }
}
