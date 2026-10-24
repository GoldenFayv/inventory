
<?php

use App\Enum\SalesReturnStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_returns', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('store_id')->constrained('stores')->cascadeOnUpdate()->restrictOnDelete();

            $table->foreignUuid('invoice_id')->constrained('invoices')->cascadeOnUpdate()->restrictOnDelete();

            $table->string('reference')->unique();
            $table->string('status')->default(SalesReturnStatus::PENDING);
            $table->string('reason');

            // All monetary values are stored in kobo.
            $table->integer('total_amount')->default(0);
            $table->integer('debt_reduction_amount')->default(0);
            $table->integer('customer_credit_amount')->default(0);

            $table->foreignUuid('requested_by')->constrained('users')->restrictOnDelete()->cascadeOnUpdate();

            $table->foreignUuid('approved_by')->nullable()->constrained('users')->restrictOnDelete()->cascadeOnUpdate();

            $table->text('approval_note')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['store_id', 'status']);
            $table->index(['invoice_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_returns');
    }
};
