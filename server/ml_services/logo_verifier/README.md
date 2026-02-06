# Fake Logo Verification Service

This service compares an uploaded product/logo photo against a curated bank of
authentic logos. It extracts feature descriptors with ORB, matches them against
stored references, and applies brand-specific similarity thresholds to decide
whether the submitted logo is likely genuine.

## How it works

1. The placeholder logos in `reference_logos/<brand>` are generated with the
   helper script `scripts/generate_reference_logos.py`. Replace them with real
   brand assets for higher fidelity.
2. When the server boots, `verifier.py` loads (or builds) a serialized feature
   database (`reference_features.pkl`) so that we do not recompute descriptors
   on every request.
3. The `/api/logo/verify` endpoint accepts an `image` file (multipart/form-data)
   and an optional `brand` hint. It returns:
   - `is_genuine`: boolean decision
   - `best_brand_match`: detected brand
   - `confidence`: ratio of good ORB matches
   - `top_matches`: diagnostic data for the best reference logos

## Updating references

Run the helper script any time you add/remove logos:

```bash
python scripts/generate_reference_logos.py
```

Or manually drop PNG/JPG files into `reference_logos/<brand>`, then delete
`reference_features.pkl` so the cache rebuilds on the next server start.

