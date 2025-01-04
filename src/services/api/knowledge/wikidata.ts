import { BaseApiService } from '../base/BaseApiService';

interface WikidataEntity {
    id: string;
    labels: {
        en?: { value: string };
    };
    descriptions: {
        en?: { value: string };
    };
    claims: Record<string, Array<{
        mainsnak: {
            datavalue?: {
                value: any;
            };
        };
    }>>;
}

export class WikidataService extends BaseApiService {
    private static readonly BASE_URL = 'https://www.wikidata.org/w/api.php';
    private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

    static async search(query: string): Promise<string | null> {
        try {
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            const entityId = await this.findEntity(query);
            if (!entityId) return null;

            const entity = await this.getEntityDetails(entityId);
            if (!entity) return null;

            const formattedContent = this.formatEntity(entity);
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('Wikidata search failed:', error);
            return null;
        }
    }

    private static async findEntity(query: string): Promise<string | null> {
        const params = new URLSearchParams({
            action: 'wbsearchentities',
            search: query,
            language: 'en',
            format: 'json',
            origin: '*'
        });

        const response = await this.fetchWithTimeout(`${this.BASE_URL}?${params}`);
        if (!response.ok) return null;

        const data = await response.json();
        return data.search?.[0]?.id || null;
    }

    private static async getEntityDetails(entityId: string): Promise<WikidataEntity | null> {
        const params = new URLSearchParams({
            action: 'wbgetentities',
            ids: entityId,
            languages: 'en',
            format: 'json',
            origin: '*'
        });

        const response = await this.fetchWithTimeout(`${this.BASE_URL}?${params}`);
        if (!response.ok) return null;

        const data = await response.json();
        return data.entities?.[entityId] || null;
    }

    private static formatEntity(entity: WikidataEntity): string {
        const parts = [
            `📌 ${entity.labels.en?.value || entity.id}`,
            entity.descriptions.en?.value ? `📝 ${entity.descriptions.en.value}` : null,
            `🔗 https://www.wikidata.org/wiki/${entity.id}`
        ].filter(Boolean);

        return parts.join('\n');
    }
} 