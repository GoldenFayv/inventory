
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { storeService } from "../../services/store.service";
import { useAuth } from "../../app/AuthProvider";

interface ILocalGovernmentArea {
  id: number | string;
  name: string;
}

interface IState {
  id: number | string;
  name: string;
  lga: ILocalGovernmentArea[];
}

interface FieldErrors {
  [key: string]: string;
}

interface CreateStoreForm {
  name: string;
  address: string;
  lga_id: string;
  zip_code: string;
}

export default function CreateStorePage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [states, setStates] = useState<IState[]>([]);
  const [selectedStateId, setSelectedStateId] = useState("");

  const [form, setForm] = useState<CreateStoreForm>({
    name: "",
    address: "",
    lga_id: "",
    zip_code: "",
  });

  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");

  // Derive the selected state and its LGAs.
  // No separate lgas state or synchronization effect is needed.
  const selectedState = states.find(
    (state) => String(state.id) === selectedStateId,
  );

  const lgas = selectedState?.lga ?? [];

  // Load states from the API.
  useEffect(() => {
    let cancelled = false;

    async function loadStates() {
      try {
        const results = await storeService.getStates();

        if (!cancelled) {
          setStates(results);
        }
      } catch {
        if (!cancelled) {
          setGeneralError(
            "Could not load states. Please refresh and try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingStates(false);
        }
      }
    }

    void loadStates();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleStateChange(value: string) {
    setSelectedStateId(value);

    // A previously selected LGA may belong to another state.
    setForm((previous) => ({
      ...previous,
      lga_id: "",
    }));

    setErrors((previous) => ({
      ...previous,
      lga_id: "",
    }));

    setGeneralError("");
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setGeneralError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrors({});
    setGeneralError("");

    if (!selectedStateId) {
      setGeneralError("Please select a state.");
      return;
    }

    if (!form.lga_id) {
      setErrors({
        lga_id: "Please select a local government area.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        lga_id: form.lga_id,
        ...(form.zip_code.trim()
          ? { zip_code: form.zip_code.trim() }
          : {}),
      };

      await storeService.create(payload);

      // Refresh the user so the app knows they now have a store.
      await refreshUser();

      navigate("/", { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data;

        if (response?.errors) {
          const validationErrors: FieldErrors = {};

          for (const [field, messages] of Object.entries(
            response.errors as Record<string, string[]>,
          )) {
            validationErrors[field] = messages[0] ?? "Invalid value.";
          }

          setErrors(validationErrors);
        } else {
          setGeneralError(
            response?.message ??
              "Could not create your store. Please try again.",
          );
        }
      } else {
        setGeneralError(
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-emerald-700">
            Store setup
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create your store
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Add your store details to start managing products,
            inventory, and credit sales.
          </p>
        </div>

        {generalError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Store name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleInputChange}
              placeholder="e.g. Favour's Provision Store"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              autoComplete="true"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Store address
            </label>

            <input
              id="address"
              name="address"
              type="text"
              required
              value={form.address}
              onChange={handleInputChange}
              placeholder="Enter your store address"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              autoComplete="true"
            />

            {errors.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="state"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              State
            </label>

            <select
              id="state"
              value={selectedStateId}
              onChange={(event) =>
                handleStateChange(event.target.value)
              }
              disabled={isLoadingStates || states.length === 0}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                {isLoadingStates
                  ? "Loading states..."
                  : states.length === 0
                    ? "No states available"
                    : "Select a state"}
              </option>

              {states.map((state) => (
                <option key={state.id} value={String(state.id)}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="lga_id"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Local government area (LGA)
            </label>

            <select
              id="lga_id"
              name="lga_id"
              value={form.lga_id}
              onChange={handleInputChange}
              disabled={!selectedStateId || lgas.length === 0}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                {!selectedStateId
                  ? "Select a state first"
                  : lgas.length === 0
                    ? "No LGAs available"
                    : "Select an LGA"}
              </option>

              {lgas.map((lga) => (
                <option key={lga.id} value={String(lga.id)}>
                  {lga.name}
                </option>
              ))}
            </select>

            {errors.lga_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lga_id}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="zip_code"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Postal code{" "}
              <span className="font-normal text-gray-400">
                (optional)
              </span>
            </label>

            <input
              id="zip_code"
              name="zip_code"
              type="text"
              value={form.zip_code}
              onChange={handleInputChange}
              placeholder="Enter postal code"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />

            {errors.zip_code && (
              <p className="mt-1 text-sm text-red-600">
                {errors.zip_code}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoadingStates}
            className="w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating store..." : "Create store"}
          </button>
        </form>
      </div>
    </main>
  );
}
