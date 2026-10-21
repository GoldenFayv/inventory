import type { IStore } from "../../../types/store.types";

import { getValidationErrors } from "../../../lib/error";
import SelectField from "../../../components/ui/SelectField";
import { storeService } from "../../../services/store.service";
import type { ILocalGovernmentArea, IState } from "../../../types/lga.types";
import Field from "../../../components/ui/Field";
import { useUpdateStore } from "../hooks/useStore";
import { useEffect, useState, type SubmitEvent } from "react";
import { MapPin, Store } from "lucide-react";

type StoreValues = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  lga_id: Id;
  zip_code: string;
};

function toValues(store: IStore): StoreValues {
  return {
    name: store.name ?? "",
    phone: store.phone ?? "",
    email: store.email ?? "",
    address: store.address ?? "",
    zip_code: store.zip_code ?? "",
    lga_id: store.lga.id,
  };
}

export default function StoreForm({
  store,
  canEdit,
}: {
  store: IStore;
  canEdit: boolean;
}) {
  const updateStore = useUpdateStore();
  const [values, setValues] = useState<StoreValues>(() => toValues(store));
  const [states, setSates] = useState<IState[] | []>([]);
  const [lgas, setLgas] = useState<ILocalGovernmentArea[] | []>([]);
  const [pickedStateId, setPickedStateId] = useState<Id>(store.lga.state.id);

  const saved = toValues(store);
  const isDirty = (Object.keys(values) as (keyof StoreValues)[]).some(
    (key) => values[key] !== saved[key],
  );

  const { message, fields } = getValidationErrors(
    updateStore.error,
    "Could not save store details. Please try again.",
  );

  useEffect(() => {
    const fetchStates = async () => {
      const results = await storeService.getStates();
      setSates(results);

      const lga = results.find((s) => s.id === pickedStateId)?.lga ?? [];
      setLgas(lga);
    };

    fetchStates();
  }, [pickedStateId]);

  function setField(key: keyof StoreValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (updateStore.isError || updateStore.isSuccess) updateStore.reset();
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || !isDirty) return;

    updateStore.mutate({
      name: values.name.trim(),
      phone: values.phone ? values.phone.trim() : undefined,
      email: values.email ? values.email.trim() : undefined,
      address: values.address.trim(),
      lga_id: values.lga_id,
      zip_code: values.zip_code.trim(),
    });
  }

  function handleDiscard() {
    setValues(toValues(store));
    updateStore.reset();
  }

  const hasFieldErrors = Object.keys(fields).length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4 rounded-card border border-border bg-surface p-4 md:p-6">
        <div className="flex items-center gap-2">
          <Store size={20} className="text-primary" />
          <div>
            <h2 className="font-semibold text-text">Business details</h2>
            <p className="text-sm text-text-muted">
              Shown on receipts and to your staff.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            className="sm:col-span-2"
            label="Store name"
            required
            value={values.name}
            onChange={(v) => setField("name", v)}
            errors={fields.name}
            disabled={!canEdit}
            placeholder="e.g. Golden Stores"
            autoComplete="organization"
          />
          <Field
            label="Phone"
            type="tel"
            value={values.phone ?? ""}
            onChange={(v) => setField("phone", v)}
            errors={fields.phone}
            disabled={!canEdit}
            placeholder="Store phone number"
            autoComplete="tel"
          />
          <Field
            label="Email"
            type="email"
            value={values.email ?? ""}
            onChange={(v) => setField("email", v)}
            errors={fields.email}
            disabled={!canEdit}
            placeholder="store@example.com"
            autoComplete="email"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-card border border-border bg-surface p-4 md:p-6">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          <div>
            <h2 className="font-semibold text-text">Location</h2>
            <p className="text-sm text-text-muted">
              Where customers can find your store.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="State"
            value={pickedStateId}
            onChange={(id) => {
              setPickedStateId(id);
              setField("lga_id", ""); // the old LGA doesn't belong to the new state
            }}
            options={states}
            placeholder={!states ? "Loading states..." : "Select a state"}
            disabled={!canEdit || !states}
          />

          <SelectField
            label="LGA"
            value={values.lga_id}
            onChange={(v) => setField("lga_id", v)}
            options={lgas}
            placeholder={
              pickedStateId ? "Select an LGA" : "Select a state first"
            }
            errors={fields.lga_id}
            disabled={!canEdit || !pickedStateId}
          />
          <Field
            className="sm:col-span-2"
            label="Street address"
            value={values.address}
            onChange={(v) => setField("address", v)}
            errors={fields.address}
            disabled={!canEdit}
            placeholder="Street and area"
            autoComplete="street-address"
          />

          <Field
            className="sm:col-span-2"
            label="Zip Code"
            value={values.zip_code}
            onChange={(v) => setField("zip_code", v)}
            errors={fields.zip_code}
            disabled={!canEdit}
            placeholder="Zip Code"
            autoComplete="street-address"
          />
        </div>
      </section>

      {updateStore.isError && !hasFieldErrors && (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      )}

      {updateStore.isSuccess && (
        <p role="status" className="text-sm text-success">
          Store details saved.
        </p>
      )}

      {!canEdit && (
        <p className="text-sm text-text-muted">
          You don't have permission to edit store details.
        </p>
      )}

      {canEdit && (
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!isDirty || updateStore.isPending}
            className="rounded-input border border-border px-4 py-2.5 text-sm font-medium text-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            Discard changes
          </button>

          <button
            type="submit"
            disabled={!isDirty || updateStore.isPending}
            className="rounded-input bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateStore.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}
    </form>
  );
}
