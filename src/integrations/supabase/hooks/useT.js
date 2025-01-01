import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/*
### t

| name       | type                     | format  | required |
|------------|--------------------------|---------|----------|
| id         | int8                     | number  | true     |
| created_at | timestamp with time zone | string  | true     |

Note: 
- 'id' is a Primary Key.
- 'created_at' has a default value of now().

No foreign key relationships are defined for this table.
*/

export const useT = (id) => useQuery({
    queryKey: ['t', id],
    queryFn: () => fromSupabase(supabase.from('t').select('*').eq('id', id).single()),
});

export const useTs = () => useQuery({
    queryKey: ['t'],
    queryFn: () => fromSupabase(supabase.from('t').select('*')),
});

export const useAddT = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newT) => fromSupabase(supabase.from('t').insert([newT])),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['t'] });
        },
    });
};

export const useUpdateT = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('t').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['t'] });
        },
    });
};

export const useDeleteT = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('t').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['t'] });
        },
    });
};