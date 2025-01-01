import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/*
### table

| name       | type                     | format    | required |
|------------|--------------------------|-----------|----------|
| id         | integer                  | bigint    | true     |
| created_at | string                   | timestamp | true     |

Note: 
- 'id' is a Primary Key.
- 'created_at' has a default value of now().

No foreign key relationships are defined for this table.
*/

export const useTable = (id) => useQuery({
    queryKey: ['table', id],
    queryFn: () => fromSupabase(supabase.from('table').select('*').eq('id', id).single()),
});

export const useTables = () => useQuery({
    queryKey: ['table'],
    queryFn: () => fromSupabase(supabase.from('table').select('*')),
});

export const useAddTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newTable) => fromSupabase(supabase.from('table').insert([newTable])),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['table'] });
        },
    });
};

export const useUpdateTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('table').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['table'] });
        },
    });
};

export const useDeleteTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('table').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['table'] });
        },
    });
};