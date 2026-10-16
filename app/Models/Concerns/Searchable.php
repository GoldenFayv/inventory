<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    /**
     * Usage: Model::search('term')
     *        Model::search('term', ['name', 'category.name'])  // override columns
     *
     * Each word must match at least one column (AND across words, OR across columns).
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);

        if ($term === '') {
            return $query;
        }

        $columns = $this->searchable ?? $this->getFillable();

        if (empty($columns)) {
            return $query;
        }

        $operator = $this->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

        foreach (preg_split('/\s+/', $term, -1, PREG_SPLIT_NO_EMPTY) as $word) {
            // Escape LIKE wildcards so "100%" or "a_b" are matched literally
            $like = '%' . addcslashes($word, '\\%_') . '%';

            // Grouped in a closure so the ORs never leak outside this clause
            $query->where(function (Builder $q) use ($columns, $like, $operator) {
                foreach ($columns as $column) {
                    if (str_contains($column, '.')) {
                        // Relation column, e.g. "category.name" or "vendor.user.email"
                        $pos = strrpos($column, '.');
                        $relation = substr($column, 0, $pos);
                        $field = substr($column, $pos + 1);

                        $q->orWhereHas($relation, fn(Builder $r) => $r->where($field, $operator, $like));
                    } else {
                        $q->orWhere($this->qualifyColumn($column), $operator, $like);
                    }
                }
            });
        }

        return $query;
    }
}
