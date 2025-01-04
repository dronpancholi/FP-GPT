interface DBpediaEntity {
    abstract?: string;
    label?: string;
    comment?: string;
    type?: string[];
    wikiPageID?: string;
}

export class DBpediaService {
    private static readonly BASE_URL = 'https://dbpedia.org/sparql';
    private static readonly CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
    private static cache = new Map<string, { data: string; timestamp: number }>();

    static async search(query: string): Promise<string | null> {
        try {
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            const sparqlQuery = `
                PREFIX dbo: <http://dbpedia.org/ontology/>
                PREFIX dbp: <http://dbpedia.org/property/>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                
                SELECT DISTINCT ?abstract ?label ?comment ?type ?wikiPageID
                WHERE {
                    ?entity rdfs:label ?label .
                    OPTIONAL { ?entity dbo:abstract ?abstract }
                    OPTIONAL { ?entity rdfs:comment ?comment }
                    OPTIONAL { ?entity rdf:type ?type }
                    OPTIONAL { ?entity dbo:wikiPageID ?wikiPageID }
                    
                    FILTER (LANG(?label) = 'en')
                    FILTER (LANG(?abstract) = 'en')
                    FILTER (CONTAINS(LCASE(?label), LCASE("${query}")))
                }
                LIMIT 5
            `;

            const params = new URLSearchParams({
                query: sparqlQuery,
                format: 'json'
            });

            const response = await fetch(`${this.BASE_URL}?${params}`);
            if (!response.ok) throw new Error('DBpedia API failed');

            const data = await response.json();
            if (!data.results?.bindings?.length) return null;

            const formattedContent = this.formatResults(data.results.bindings);
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('DBpedia search failed:', error);
            return null;
        }
    }

    private static formatResults(results: any[]): string {
        return results
            .map(result => {
                const entity: DBpediaEntity = {
                    abstract: result.abstract?.value,
                    label: result.label?.value,
                    comment: result.comment?.value,
                    type: result.type?.value.split('/').pop(),
                    wikiPageID: result.wikiPageID?.value
                };

                const parts = [
                    `📌 ${entity.label}`,
                    entity.abstract ? `📝 ${this.truncateText(entity.abstract, 300)}` : null,
                    entity.comment ? `💡 ${entity.comment}` : null,
                    entity.type ? `🏷️ Type: ${entity.type}` : null,
                    entity.wikiPageID ? `🔗 Wikipedia ID: ${entity.wikiPageID}` : null
                ].filter(Boolean);

                return parts.join('\n');
            })
            .join('\n\n---\n\n');
    }

    private static truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    private static getFromCache(query: string): string | null {
        const cached = this.cache.get(query);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    private static addToCache(query: string, data: string): void {
        this.cache.set(query, {
            data,
            timestamp: Date.now()
        });

        if (this.cache.size > 100) {
            const oldestKey = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            this.cache.delete(oldestKey);
        }
    }
} 