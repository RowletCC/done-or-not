# Done or not?

**Six traces. One completed task.**

A small interactive lab about the gap between an API response and a finished result. Choose a synthetic document-export trace, inspect the evidence, and reveal the verdict.

[**Try the experiment →**](https://rowletcc.github.io/done-or-not/) · [Read the checker](docs/assess.js) · [Run a fixture](examples)

## The question

A request returns `200 OK`. The tool might still report an error. A worker might still be running. The file might be the wrong export.

This lab follows one explicit contract: **produce `report-final.pdf` and confirm that it can be read**. It keeps transport acknowledgment, tool outcome, job status and artifact evidence separate.

| Trace | What happened | Verdict |
|---|---|---|
| Accepted | The export worker is still running | Pending |
| Green envelope | The tool returned an execution error inside HTTP 200 | Failed |
| Something exists | A readable draft appeared instead of the final export | Failed |
| Done, apparently | The worker said completed, but there is no artifact check | Unknown |
| The full path | The completed job produced the requested readable export | Completed |
| Named, not readable | The expected filename exists, but the read check failed | Failed |

## Run it

Node 18 or later; no npm packages to install.

```sh
git clone https://github.com/RowletCC/done-or-not.git
cd done-or-not
node --test
node bin/check.mjs examples/completed.json
```

The CLI prints the verdict and evidence layers. Exit codes: `0` = completed under this contract; `1` = failed, pending or unknown; `2` = invalid JSON, unreadable input file or usage error. The JSON status distinguishes the non-completed outcomes.

Run the interactive page locally with Python 3:

```sh
python3 -m http.server 8080 --directory docs
```

Open `http://localhost:8080`. There are no analytics, model calls, credentials or external runtime dependencies. The site and CLI use the same checker.

## Adapt a fixture

```json
{
  "transport": {"status": 200},
  "tool": {"isError": false},
  "job": {"status": "completed"},
  "artifact": {
    "expected": "report-final.pdf",
    "observed": "report-final.pdf",
    "readable": true
  }
}
```

Checks stop at the first failed, pending or unknown layer. Later supplied fields cannot overrule an earlier failure. Missing evidence remains unknown. For this fixture format, `tool.isError` must be explicitly true or false; this is **not** a claim that all protocols require that field.

## Scope

This is a teaching tool and a narrow, deterministic contract checker. It is not a model benchmark, MCP conformance test, remote execution verifier, or document-quality evaluator. All included traces are synthetic. The checker trusts the input observations; it does not independently open a file or authenticate a trace.

The MCP example is grounded in the [official TypeScript SDK error documentation](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/servers/errors.md), which distinguishes protocol errors from tool execution errors. The four-layer export contract is our example, not part of the MCP standard.

## Contribute or request a workflow check

A useful contribution includes a concrete workflow, the completion rule, a minimal synthetic fixture and the expected verdict. Keep private payloads out of issues. Generalizing the checker should not blur the difference between missing evidence and failure.

For a scoped integration, data-cleanup or reproducibility project, [describe the workflow and acceptance criteria](https://github.com/RowletCC/done-or-not/issues/new?template=project-request.yml). An inquiry is not a booking; scope and price are agreed separately.

Published by **rowlet**, an independent technical account. Created with AI-assisted development; tests and explicit limitations accompany the implementation. MIT licensed.
