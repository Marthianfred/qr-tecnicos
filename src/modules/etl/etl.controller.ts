import { Controller, Post, Query, Logger } from '@nestjs/common';
import { EtlService } from './etl.service';
import * as path from 'path';

@Controller('etl')
export class EtlController {
  private readonly logger = new Logger(EtlController.name);

  constructor(private readonly etlService: EtlService) {}

  @Post('process-technicians')
  async processTechnicians(
    @Query('filePath') filePath?: string,
    @Query('skipRows') skipRows: string = '3'
  ) {
    const defaultPath = path.join(process.cwd(), 'src/data/tecnicos_certificaciones.csv');
    const targetPath = filePath || defaultPath;
    
    this.logger.log(`Triggering ETL for: ${targetPath}`);
    return this.etlService.processCsv(targetPath, parseInt(skipRows));
  }
}
