/** A deliberately narrow contract for a synthetic document-export workflow. */
export function assess(trace) {
  const layers = [];
  const add = (name, state, detail) => layers.push({ name, state, detail });
  const finish = (status) => ({ status, layers });
  if (!trace || typeof trace !== 'object' || Array.isArray(trace)) {
    add('Input', 'unknown', 'Expected an export trace object.');
    return finish('unknown');
  }
  const code = trace.transport?.status;
  if (!Number.isInteger(code) || code < 100 || code > 599) {
    add('Transport', 'unknown', 'No valid HTTP status was recorded.');
    return finish('unknown');
  }
  if (code < 200 || code >= 300) {
    add('Transport', 'failed', `HTTP ${code} did not acknowledge this request successfully.`);
    return finish('failed');
  }
  add('Transport', 'passed', `HTTP ${code}: the request was acknowledged.`);
  if (trace.tool?.isError === true) {
    add('Tool', 'failed', 'The tool explicitly reported an error inside the response.');
    return finish('failed');
  }
  if (trace.tool?.isError !== false) {
    add('Tool', 'unknown', 'This fixture contract requires an explicit tool outcome.');
    return finish('unknown');
  }
  add('Tool', 'passed', 'The tool reported no execution error.');
  const status = trace.job?.status;
  if (['queued', 'running'].includes(status)) {
    add('Job', 'pending', `The export job is ${status}; completion has not been reported.`);
    return finish('pending');
  }
  if (['failed', 'cancelled'].includes(status)) {
    add('Job', 'failed', `The export job is ${status}.`);
    return finish('failed');
  }
  if (status !== 'completed') {
    add('Job', 'unknown', 'No recognized final job outcome was recorded.');
    return finish('unknown');
  }
  add('Job', 'passed', 'The export job reported completion.');
  const artifact = trace.artifact;
  if (!artifact || typeof artifact.expected !== 'string' || !artifact.expected.trim() ||
      typeof artifact.observed !== 'string' || !artifact.observed.trim() ||
      typeof artifact.readable !== 'boolean') {
    add('Artifact', 'unknown', 'The expected name, observed name, and read check are required.');
    return finish('unknown');
  }
  if (!artifact.readable) {
    add('Artifact', 'failed', 'The observed export could not be read.');
    return finish('failed');
  }
  if (artifact.expected !== artifact.observed) {
    add('Artifact', 'failed', 'The readable file is not the requested export.');
    return finish('failed');
  }
  add('Artifact', 'passed', 'The requested export was observed and was readable in this fixture.');
  return finish('completed');
}
