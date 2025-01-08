-- RUN 1st
create extension vector;

-- RUN 2nd
create table docusuite (
  id bigserial primary key,
  user_id TEXT,
  documentId TEXT,
  text_chunk TEXT,
  embedding VECTOR(768),  -- Adjust based on your embedding model's dimension
  metadata JSONB
);

-- RUN 3rd
create or replace function docusuite_search (
  document_id text,
  query_embedding vector(768),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  user_id TEXT,
  documentId TEXT,
  text_chunk TEXT,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    docusuite.id,
    docusuite.user_id,
    docusuite.documentId,
    docusuite.text_chunk,
    1 - (docusuite.embedding <=> query_embedding) as similarity
  from docusuite
  where docusuite.documentId = document_id
    and 1 - (docusuite.embedding <=> query_embedding) > similarity_threshold
  order by docusuite.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RUN 4th
create index on docusuite 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

