// ===== HELPER: PARA BUSCAR DADOS RELACIONADOS =====

import { Projects } from "@/domain/entities/projects/projects.entity";
import { ProjectsToResponseMapper } from "./projects-to-response.mapper";


// ===== HELPER: PARA BUSCAR DADOS RELACIONADOS =====

export class ProjectsRelationHelper {
  /**
   * Busca dados do proprietário quando necessário
   * (usado quando a entidade não tem objeto User completo)
   */
  public static async enrichWithOwnerData(
    projects: Projects, 
    userRepository: any
  ): Promise<any> {
    const owner = await userRepository.findById(projects.getOwnerId());
    
    return {
      ...ProjectsToResponseMapper.map(projects),
      owner: owner ? {
        id: owner.getId(),
        name: owner.getName(),
        email: owner.getEmail(),
        avatar: owner.getAvatar()
      } : null
    };
  }

  /**
   * Busca dados do moderador que aprovou quando necessário
   */
  public static async enrichWithApproverData(
    projects: Projects,
    userRepository: any
  ): Promise<any> {
    const approver = projects.getApprovedById() 
      ? await userRepository.findById(projects.getApprovedById())
      : null;
    
    return {
      ...ProjectsToResponseMapper.map(projects),
      approvedBy: approver ? {
        id: approver.getId(),
        name: approver.getName(),
        email: approver.getEmail()
      } : null
    };
  }
}