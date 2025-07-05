// src/infra/services/storage/railway/railway-storage.service.provider.ts

import { StorageService } from '../storage.service';
import { RailwayStorageService } from './railway-storage.service';

export const railwayStorageServiceProvider = {
  provide: StorageService,
  useClass: RailwayStorageService,
};