-- Prices must rise from Lille to Mellem to Stor within one occasion.
-- A plain CHECK cannot compare rows, so this is a constraint trigger.
-- It is DEFERRABLE INITIALLY DEFERRED: it runs at commit, against the final
-- prices, so raising all three prices in one transaction never fails halfway.
-- Tier values compare in declared order (lille < mellem < stor).
CREATE FUNCTION check_tier_price_order() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM occasion_tiers AS other
    WHERE other.occasion_id = NEW.occasion_id
      AND other.tier <> NEW.tier
      AND (
        (other.tier < NEW.tier AND other.price_oere >= NEW.price_oere)
        OR (other.tier > NEW.tier AND other.price_oere <= NEW.price_oere)
      )
  ) THEN
    RAISE EXCEPTION 'Tier prices must rise from lille to mellem to stor (occasion %)', NEW.occasion_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END;
$$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER occasion_tiers_price_order
AFTER INSERT OR UPDATE OF price_oere, tier ON occasion_tiers
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION check_tier_price_order();
