<?php

namespace App\Models\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

trait FileUpload
{
    public function uploadFile(UploadedFile $file, string $name, string $collection = 'default'): Media
    {
        return $this->uploadFiles([$name => $file], $collection)->first();
    }

    /**
     * @param  array<string, UploadedFile>|UploadedFile[]  $files  name => file (or a plain list to reuse the original name)
     * @return Collection<int, Media>
     */
    public function uploadFiles(array $files, string $collection = 'default'): Collection
    {
        $storeId = $this->store_id ?? null;

        return DB::transaction(function () use ($files, $collection, $storeId) {
            $media = collect();

            foreach ($files as $name => $file) {
                $media->push(
                    $this->addMedia($file)
                        ->usingName(is_string($name) ? $name : $file->getClientOriginalName())
                        ->usingFileName($this->safeFileName($file))
                        ->withCustomProperties(['store_id' => $storeId])
                        ->toMediaCollection($collection)
                );
            }

            return $media;
        });
    }

    private function safeFileName(UploadedFile $file): string
    {
        return \Illuminate\Support\Str::uuid() . '.' . $file->guessExtension();
    }
}
