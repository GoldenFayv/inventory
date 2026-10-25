import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useParams, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Printer } from "lucide-react";
import { useSale, useUpdateSale } from "./useSales";
import AddItemsForm from "./components/AddItemsForm";
import PayInvoiceForm from "./components/PayInvoiceForm";
import SaleInvoice from "./components/SaleInvoice";
import SaleReceipt from "./components/SaleReceipt";
import DocumentTypeSwitch, {type DocumentType} from "./components/Documenttypeswitch";
import { useProducts } from "../products/useProduct";
import type { IInvoice } from "./types/sale.types";
import PrintPortal from "./components/PrintPortal";

const STORAGE_KEY = "tallyhouse:sale-document-type";

function readStoredType(): DocumentType {
  try {
    return localStorage.getItem(STORAGE_KEY) === "receipt"
      ? "receipt"
      : "invoice";
  } catch {
    return "invoice";
  }
}

export default function SaleDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const saleQuery = useSale(id);
  const sale = saleQuery.data;

  const updateSale = useUpdateSale(id);

  const [documentType, setDocumentType] =
    useState<DocumentType>(readStoredType);

  // Fresh, server-verified copy that exists only while printing
  const [printSale, setPrintSale] = useState<IInvoice | null>(null);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [printError, setPrintError] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(productSearch.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [productSearch]);

  const products = useProducts(1, debouncedSearch);

  function handleDocumentTypeChange(next: DocumentType) {
    setDocumentType(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable; the choice just won't be remembered.
    }
  }

  async function handlePrint() {
    setPrintError("");
    setIsPreparingPrint(true);

    try {
      // Always hits the server, regardless of staleTime
      const result = await saleQuery.refetch();
      const fresh = result.data;

      if (result.isError || !fresh) {
        setPrintError(
          "We couldn't verify this document with the server. Check your connection and try again.",
        );
        return;
      }

      // Mount brand-new DOM built only from the server response, then print it
      flushSync(() => setPrintSale(fresh));

      window.addEventListener("afterprint", () => setPrintSale(null), {
        once: true,
      });
      window.print();
    } finally {
      setIsPreparingPrint(false);
    }
  }

  function handlePayment(amount: number, method: "cash" | "transfer") {
    updateSale.mutate({ amount: amount, payment_method: method });
  }

  function handleAddItems(items: { product_id: Id; quantity: number }[]) {
    updateSale.mutate({ items });
  }

  if (saleQuery.isPending) {
    return (
      <main className="p-6 text-sm text-text-muted">
        Loading sale details...
      </main>
    );
  }

  if (saleQuery.isError || !sale) {
    return (
      <main className="space-y-4 rounded-card border border-border bg-surface p-6">
        <AlertCircle className="text-red-500" size={28} />
        <h1 className="font-semibold text-text">Could not load this sale</h1>
        <button
          type="button"
          onClick={() => void saleQuery.refetch()}
          className="rounded-input bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <Link to="/sales" className="block text-sm text-primary">
          Back to sales
        </Link>
      </main>
    );
  }

  const isInvoice = documentType === "invoice";
  const widthClass = isInvoice ? "max-w-3xl" : "max-w-md";

  return (
    <main className="space-y-6 pb-8">
      {/* Screen-only toolbar */}
      <div
        className={`mx-auto flex flex-wrap items-center justify-between gap-3 print:hidden ${widthClass}`}
      >
        <Link
          to="/sales"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft size={18} />
          Back to sales
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <DocumentTypeSwitch
            value={documentType}
            onChange={handleDocumentTypeChange}
          />

          <button
            type="button"
            onClick={() => void handlePrint()}
            disabled={isPreparingPrint || updateSale.isPending}
            aria-busy={isPreparingPrint}
            className="inline-flex items-center gap-2 rounded-input bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Printer size={17} />
            {isPreparingPrint
              ? "Verifying..."
              : `Print ${isInvoice ? "invoice" : "receipt"}`}
          </button>
        </div>
      </div>

      {printError && (
        <p
          role="alert"
          className={`mx-auto rounded-lg bg-red-50 p-3 text-sm text-danger print:hidden ${widthClass}`}
        >
          {printError}
        </p>
      )}

      {/* The selected document is the only thing that prints */}
      {isInvoice ? <SaleInvoice sale={sale} /> : <SaleReceipt sale={sale} />}

      {/* Actions: never printed */}
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-2 print:hidden">
        <section className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-4 text-lg font-semibold text-text">Pay invoice</h2>

          <PayInvoiceForm
            balance={Math.max(0, sale.total_amount - sale.total_amount_paid)}
            isPending={updateSale.isPending}
            onSubmit={handlePayment}
          />
        </section>

        <section className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-4 text-lg font-semibold text-text">Add items</h2>

          <AddItemsForm
            products={products.data?.data ?? []}
            isLoading={products.isLoading}
            isPending={updateSale.isPending}
            search={productSearch}
            onSearchChange={setProductSearch}
            onSubmit={handleAddItems}
          />
        </section>
      </div>

      {/* Print-only copy, rebuilt from freshly fetched data on each print */}
      {printSale && (
        <PrintPortal>
          {isInvoice ? (
            <SaleInvoice sale={printSale} />
          ) : (
            <SaleReceipt sale={printSale} />
          )}
        </PrintPortal>
      )}
    </main>
  );
}
