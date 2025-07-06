import { CreateProjectOutput } from '@/usecases/projects/create/create-project.usecase';
import { CreateProjectMultipartResponse } from './create-project-multipart.dto';

export class CreateProjectMultipartPresenter {
  public static toHttp(
    output: CreateProjectOutput,
    uploadedImages: Array<{
      id: string;
      url: string;
      filename: string;
      isMain: boolean;
      size: number;
    }>
  ): CreateProjectMultipartResponse {
    return {
      id: output.id,
      name: output.name,
      status: output.status,
      createdAt: output.createdAt,
      images: uploadedImages,
    };
  }
}