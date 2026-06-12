# GitHub Release Checklist

Before creating the public repository:

- [ ] Confirm `.env` does not exist in the files to be committed.
- [ ] Confirm no CROO SDK key appears in source, docs, tests, logs, or screenshots.
- [ ] Confirm `node_modules/`, `dist/`, and `outputs/` are ignored.
- [ ] Run `npm test`.
- [ ] Run `npm run mock`.
- [ ] Review `README.md` for setup, SDK methods, and integration notes.
- [ ] Review `LICENSE` for MIT license.
- [x] Configure local git author identity with a GitHub noreply-style email.
- [x] Create the initial local commit.
- [x] Add the public GitHub URL to `docs/DORAHACKS_SUBMISSION_DRAFT.md`.
- [ ] Add the demo video URL after recording.
- [ ] Tag the submission version after the live paid order test.

Suggested repository:

- Name: `croo-onchain-risk-agent`
- Description: `CROO CAP provider agent for USDC-paid on-chain risk reports`
- Visibility: public
- License: MIT

Suggested first commit message:

```text
Initial CROO onchain risk agent
```

Do not push until the user confirms GitHub publication.
