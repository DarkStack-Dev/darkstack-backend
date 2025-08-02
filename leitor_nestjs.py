import os
import datetime
from pathlib import Path

def ler_estrutura_nestjs(caminho_projeto, arquivo_saida="estrutura_projeto.md"):
    """
    Lê a estrutura de um projeto NestJS e gera um arquivo markdown
    
    Args:
        caminho_projeto (str): Caminho para o diretório do projeto
        arquivo_saida (str): Nome do arquivo markdown de saída
    """
    
    # Extensões de arquivos relevantes para NestJS
    extensoes_relevantes = {
        '.ts', '.js', '.json', '.md', '.yml', '.yaml', 
        '.env', '.gitignore', '.dockerignore', '.dockerfile'
    }
    
    # Pastas a serem ignoradas
    pastas_ignoradas = {
        'node_modules', 'dist', 'build', '.git', '.vscode', 
        '.idea', 'coverage', '.nyc_output', 'logs'
    }
    
    estrutura = []
    contadores = {'arquivos': 0, 'diretorios': 0}
    
    # Converte para Path para melhor manipulação
    projeto_path = Path(caminho_projeto)
    
    if not projeto_path.exists():
        print(f"❌ Erro: O caminho '{caminho_projeto}' não existe!")
        return
    
    print(f"🔍 Analisando projeto em: {projeto_path.absolute()}")
    
    # Percorre toda a estrutura do projeto
    for root, dirs, files in os.walk(projeto_path):
        # Remove pastas ignoradas da lista de diretórios
        dirs[:] = [d for d in dirs if d not in pastas_ignoradas]
        
        # Calcula o caminho relativo
        caminho_relativo = Path(root).relative_to(projeto_path)
        contadores['diretorios'] += 1
        
        # Processa arquivos no diretório atual
        for arquivo in files:
            extensao = Path(arquivo).suffix.lower()
            
            # Filtra apenas arquivos relevantes
            if extensao in extensoes_relevantes or arquivo.startswith('.env'):
                caminho_completo = caminho_relativo / arquivo
                estrutura.append(str(caminho_completo))
                contadores['arquivos'] += 1
    
    # Ordena a estrutura
    estrutura.sort()
    
    # Gera o arquivo markdown
    gerar_markdown(estrutura, arquivo_saida, projeto_path.name, contadores)
    
    print(f"✅ Arquivo gerado: {arquivo_saida}")
    print(f"📊 Estatísticas: {contadores['arquivos']} arquivos, {contadores['diretorios']} diretórios")

def gerar_markdown(estrutura, arquivo_saida, nome_projeto, contadores):
    """Gera o arquivo markdown com a estrutura do projeto"""
    
    with open(arquivo_saida, 'w', encoding='utf-8') as f:
        # Cabeçalho
        f.write(f"# Estrutura do Projeto: {nome_projeto}\n\n")
        f.write(f"**Data de geração:** {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
        f.write(f"**Estatísticas:**\n")
        f.write(f"- 📁 Diretórios: {contadores['diretorios']}\n")
        f.write(f"- 📄 Arquivos: {contadores['arquivos']}\n\n")
        
        # Árvore de arquivos
        f.write("## 🌳 Estrutura de Arquivos\n\n")
        f.write("```\n")
        
        for caminho in estrutura:
            f.write(f"{caminho}\n")
        
        f.write("```\n\n")
        
        # Organização por tipo de arquivo
        f.write("## 📋 Arquivos por Categoria\n\n")
        
        categorias = {
            'TypeScript': ['.ts'],
            'JavaScript': ['.js'],
            'Configuração': ['.json', '.yml', '.yaml', '.env'],
            'Documentação': ['.md'],
            'Docker': ['.dockerfile'],
            'Outros': ['.gitignore', '.dockerignore']
        }
        
        for categoria, exts in categorias.items():
            arquivos_categoria = [arq for arq in estrutura 
                                if any(arq.endswith(ext) for ext in exts) 
                                or any(arq.startswith(prefix) for prefix in ['.env', '.git'])]
            
            if arquivos_categoria:
                f.write(f"### {categoria}\n\n")
                for arq in arquivos_categoria:
                    f.write(f"- `{arq}`\n")
                f.write("\n")

def gerar_estrutura_detalhada(caminho_projeto, arquivo_saida="estrutura_detalhada.md"):
    """Versão mais detalhada com informações sobre os arquivos"""
    
    projeto_path = Path(caminho_projeto)
    pastas_ignoradas = {'node_modules', 'dist', 'build', '.git', '.vscode', '.idea'}
    
    with open(arquivo_saida, 'w', encoding='utf-8') as f:
        f.write(f"# Estrutura Detalhada: {projeto_path.name}\n\n")
        f.write(f"**Gerado em:** {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
        
        for root, dirs, files in os.walk(projeto_path):
            dirs[:] = [d for d in dirs if d not in pastas_ignoradas]
            
            caminho_relativo = Path(root).relative_to(projeto_path)
            
            if files:  # Só mostra diretórios que têm arquivos
                f.write(f"## 📁 {caminho_relativo}\n\n")
                
                for arquivo in sorted(files):
                    arquivo_path = Path(root) / arquivo
                    try:
                        tamanho = arquivo_path.stat().st_size
                        tamanho_str = formatar_tamanho(tamanho)
                        f.write(f"- **{arquivo}** ({tamanho_str})\n")
                    except:
                        f.write(f"- **{arquivo}**\n")
                
                f.write("\n")

def formatar_tamanho(tamanho_bytes):
    """Formata o tamanho do arquivo em formato legível"""
    if tamanho_bytes < 1024:
        return f"{tamanho_bytes}B"
    elif tamanho_bytes < 1024**2:
        return f"{tamanho_bytes/1024:.1f}KB"
    else:
        return f"{tamanho_bytes/(1024**2):.1f}MB"

def main():
    """Função principal - exemplo de uso"""
    
    # Solicita o caminho do projeto
    print("🏗️  Leitor de Estrutura NestJS")
    print("=" * 40)
    
    caminho = input("Digite o caminho do projeto NestJS: ").strip()
    
    if not caminho:
        caminho = "."  # Diretório atual
    
    # Opções de geração
    print("\nOpções disponíveis:")
    print("1. Estrutura simples (padrão)")
    print("2. Estrutura detalhada (com tamanhos)")
    print("3. Ambas")
    
    opcao = input("\nEscolha uma opção (1-3): ").strip()
    
    if opcao == "2":
        gerar_estrutura_detalhada(caminho)
        print("✅ Estrutura detalhada gerada!")
    elif opcao == "3":
        ler_estrutura_nestjs(caminho)
        gerar_estrutura_detalhada(caminho)
        print("✅ Ambas estruturas geradas!")
    else:
        ler_estrutura_nestjs(caminho)

if __name__ == "__main__":
    main()