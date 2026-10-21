<?php

namespace App\Http\Controllers;

use App\Actions\CreateUser;
use App\DataTransferObjects\NewUserContext;
use App\Events\NewUserEvent;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserStoreResource;
use App\Models\UserStore;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

class StaffController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        app(PermissionRegistrar::class)->setPermissionsTeamId($user->active_store_id);

        $staff = UserStore::with(['last_login', 'user', 'roles'])
            ->search($request->input("search"))
            ->whereHas("user")
            ->whereNotNull('user_id')
            ->where('store_id', $user->active_store_id)
            ->paginate($request->integer('per_page', 10));

        return UserStoreResource::collection($staff);
    }

    public function store(Request $request, CreateUser $createUser): UserResource
    {
        $data = $request->all();

        $data['password'] = Str::password(10);

        $data['password'] = app()->isLocal() ? 'Pa$$w0rd!' : bin2hex(random_bytes(4)) . '!' . chr(rand(65, 90)) . chr(rand(97, 122)) . rand(0, 9);

        $user = $createUser->handle($data);

        NewUserEvent::dispatch($user, new NewUserContext($request->user()->active_store_id));

        return new UserResource($user);
    }
}
