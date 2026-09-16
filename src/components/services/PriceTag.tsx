import { useAccountStatus } from "@/hooks/use-account-status";
import type { Service } from "@/lib/services";

/**
 * Prices are only shown to clients (her first paid booking, build, podcast
 * slot or workshop). A lead — anonymous or signed in but not yet a client —
 * sees where pricing comes from instead. "Free" is never hidden.
 */
export function PriceTag({ service }: { service: Service }) {
  const { isClient } = useAccountStatus();

  if (service.price === "Free" || isClient) {
    return (
      <>
        {service.price}
        {service.priceNote ? (
          <span className="ml-3 align-middle text-base text-muted-foreground">
            {service.priceNote}
          </span>
        ) : null}
      </>
    );
  }

  return <>Shared on your free Clarity Call</>;
}
