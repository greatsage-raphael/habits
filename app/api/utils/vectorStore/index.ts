import { BaseRetriever } from '@langchain/core/retrievers';
import { supabase, genAI } from '../../../../scripts/admin';

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
const embeddingModel = genAI.getGenerativeModel({
  model: 'text-embedding-004',
});

async function searchSupabase(chatId: string, query: string) {
    const embeddingResult = await embeddingModel.embedContent(query);
    const query_embedding = embeddingResult.embedding.values;
    //console.log("QueryEmbed =", embeddingResult.embedding);
    console.log('Embedding length:', query_embedding.length);
  
    if (!Array.isArray(query_embedding) || query_embedding.length !== 768) {
      throw new Error(
        'Invalid query embedding: must be an array of 768 numbers.',
      );
    }
  
    let { data, error } = await supabase.rpc('docusuite_search', {
      document_id: chatId,
      match_count: 3,
      query_embedding: query_embedding,
      similarity_threshold: 0.1,
    });
    if (error) console.error(error);
  
    if (error) throw new Error(`Supabase search error: ${error.message}`);
    return data;
  }

  export class SupabaseRetriever extends BaseRetriever {
    private chatId: string;
  
    constructor(chatId: string) {
      super();
      this.chatId = chatId;
    }
  
    // Implementation of the required abstract member
    lc_namespace = ['supabase', 'retriever'];
  
    async getRelevantDocuments(query: string) {
      // Call your Supabase search function
      const results = await searchSupabase(this.chatId, query);
  
      // Map the results to the format expected by LangChain
      return results.map((doc: any) => ({
        pageContent: doc.content, // Replace with the actual field containing the document text
        metadata: doc.metadata || {}, // Replace with any metadata your result provides
      }));
    }
  }
