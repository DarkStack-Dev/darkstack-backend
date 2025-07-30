import { Projects } from "@/domain/entities/projects/projects.entity";
import { ProjectStatus } from "generated/prisma";

/**
 * Gateway Repository Interface para Projects
 * Define todos os métodos que devem ser implementados pelos repositórios concretos
 */
export abstract class ProjectsGatewayRepository {
  
  // ===== MÉTODOS BÁSICOS DE CRUD =====
  
  /**
   * Busca um projeto por ID (apenas ativos)
   */
  public abstract findById(id: string): Promise<Projects | null>;
  
  /**
   * Busca um projeto por ID incluindo soft deleted
   */
  public abstract findByIdIncludingDeleted(id: string): Promise<Projects | null>;
  
  /**
   * Lista todos os projetos ativos
   */
  public abstract findAll(): Promise<Projects[]>;
  
  /**
   * Cria um novo projeto
   */
  public abstract create(project: Projects): Promise<void>;
  
  /**
   * Atualiza um projeto existente
   */
  public abstract update(project: Projects): Promise<void>;
  
  /**
   * Soft delete de um projeto
   */
  public abstract softDelete(id: string): Promise<void>;
  
  /**
   * Hard delete de um projeto (remoção permanente)
   */
  public abstract hardDelete(id: string): Promise<void>;
  
  /**
   * Restaura um projeto soft deleted
   */
  public abstract restore(id: string): Promise<void>;

  // ===== MÉTODOS DE BUSCA POR FILTROS =====
  
  /**
   * Busca projetos por status
   */
  public abstract findByStatus(status: ProjectStatus): Promise<Projects[]>;
  
  /**
   * Busca projetos por proprietário
   */
  public abstract findByOwnerId(ownerId: string): Promise<Projects[]>;
  
  /**
   * Busca projetos pendentes (para moderação)
   */
  public abstract findPendingProjects(): Promise<Projects[]>;
  
  /**
   * Busca projetos soft deleted
   */
  public abstract findSoftDeleted(): Promise<Projects[]>;
  
  /**
   * Busca projetos com filtros avançados e paginação
   */
  public abstract findWithFilters(filters: {
    status?: ProjectStatus;
    ownerId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ projects: Projects[]; total: number }>;

  // ===== MÉTODOS DE CONTAGEM =====
  
  /**
   * Conta quantos projetos um usuário possui (ativos)
   */
  public abstract amountProjectsByUserId(ownerId: string): Promise<number>;
  
  /**
   * Conta quantos projetos um usuário possui por status
   */
  public abstract amountProjectsByUserIdAndStatus(
    ownerId: string, 
    status: ProjectStatus
  ): Promise<number>;

  // ===== MÉTODOS DE MODERAÇÃO =====
  
  /**
   * Aprova um projeto
   */
  public abstract approveProject(
    projectId: string, 
    approvedById: string, 
    approvedAt?: Date
  ): Promise<void>;
  
  /**
   * Rejeita um projeto
   */
  public abstract rejectProject(
    projectId: string, 
    rejectionReason: string
  ): Promise<void>;
  
  /**
   * Arquiva um projeto
   */
  public abstract archiveProject(projectId: string): Promise<void>;

  // ===== MÉTODOS DE ESTATÍSTICAS =====
  
  /**
   * Retorna estatísticas gerais dos projetos
   */
  public abstract getProjectStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
  }>;

  // ===== MÉTODOS OPCIONAIS PARA IMPLEMENTAÇÕES FUTURAS =====
  
  /**
   * Busca projetos populares (mais curtidos/visualizados)
   * Implementação opcional para funcionalidades futuras
   */
  public findPopularProjects?(limit?: number): Promise<Projects[]>;
  
  /**
   * Busca projetos recentes aprovados
   * Implementação opcional para funcionalidades futuras
   */
  public findRecentApprovedProjects?(limit?: number): Promise<Projects[]>;
  
  /**
   * Busca projetos similares (por tags ou conteúdo)
   * Implementação opcional para funcionalidades futuras
   */
  public findSimilarProjects?(projectId: string, limit?: number): Promise<Projects[]>;
  
  /**
   * Busca projetos por tags
   * Implementação opcional para funcionalidades futuras
   */
  public findByTags?(tags: string[]): Promise<Projects[]>;
  
  /**
   * Atualiza estatísticas de visualização
   * Implementação opcional para funcionalidades futuras
   */
  public incrementViewCount?(projectId: string): Promise<void>;
  
  /**
   * Busca projetos que precisam de revisão automática
   * Implementação opcional para funcionalidades futuras
   */
  public findProjectsForAutoReview?(): Promise<Projects[]>;
}

// ===== TIPOS AUXILIARES PARA O GATEWAY =====

/**
 * Filtros avançados para busca de projetos
 */
export interface ProjectSearchFilters {
  status?: ProjectStatus | ProjectStatus[];
  ownerId?: string;
  approvedById?: string;
  search?: string; // Busca no nome e descrição
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  hasImages?: boolean;
  minParticipants?: number;
  maxParticipants?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Resultado paginado de projetos
 */
export interface PaginatedProjectsResult {
  projects: Projects[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Estatísticas detalhadas de projetos
 */
export interface DetailedProjectStats {
  total: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
  };
  byPeriod: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  topOwners: {
    userId: string;
    userName: string;
    projectCount: number;
  }[];
  averageImagesPerProject: number;
  averageParticipantsPerProject: number;
}

/**
 * Configurações para operações em lote
 */
export interface BatchProjectOperation {
  projectIds: string[];
  operation: 'approve' | 'reject' | 'archive' | 'delete';
  moderatorId?: string;
  reason?: string;
}

// ===== EXTENSÃO PARA REPOSITÓRIOS ESPECIALIZADOS =====

/**
 * Gateway estendido para operações administrativas
 */
export abstract class ProjectsAdminGatewayRepository extends ProjectsGatewayRepository {
  
  /**
   * Operações em lote para moderadores
   */
  public abstract batchOperation(operation: BatchProjectOperation): Promise<{
    success: string[];
    failed: { id: string; error: string }[];
  }>;
  
  /**
   * Busca projetos com relatórios/denúncias
   */
  public abstract findProjectsWithReports(): Promise<Projects[]>;
  
  /**
   * Obtém histórico de mudanças de um projeto
   */
  public abstract getProjectAuditLog(projectId: string): Promise<any[]>;
  
  /**
   * Estatísticas detalhadas para dashboard admin
   */
  public abstract getDetailedStats(
    dateFrom?: Date, 
    dateTo?: Date
  ): Promise<DetailedProjectStats>;
}

/**
 * Gateway estendido para operações de cache
 */
export abstract class ProjectsCachedGatewayRepository extends ProjectsGatewayRepository {
  
  /**
   * Invalida cache de um projeto específico
   */
  public abstract invalidateProjectCache(projectId: string): Promise<void>;
  
  /**
   * Invalida cache de projetos de um usuário
   */
  public abstract invalidateUserProjectsCache(userId: string): Promise<void>;
  
  /**
   * Pré-carrega projetos populares no cache
   */
  public abstract preloadPopularProjects(): Promise<void>;
}