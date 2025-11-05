// We import inside the test after stubbing fetch to ensure the function uses our mock

let mockGraph: unknown;
jest.mock('../../lib/graph/loader', () => ({
  __esModule: true,
  loadGraphFromUrl: jest.fn(() => Promise.resolve(mockGraph)),
}));

describe('lib/example_graphs_cache.getListExampleGraphUrls', () => {
  const originalFetch = global.fetch as typeof fetch;

  afterEach(() => {
    // Restore original fetch to avoid side effects across tests
    global.fetch = originalFetch;
  });

  it('deduplicates URLs while preserving order', async () => {
    const files = [
      '/graphs/a.json',
      '/graphs/b.json',
      '/graphs/a.json',
      '/graphs/c.json',
      '/graphs/b.json',
    ];

    // Mock fetch to return our files list
    const mockFetch = jest.fn<Promise<Response>, Parameters<typeof fetch>>().mockResolvedValue({
      ok: true,
      json: async () => ({ files }),
    } as unknown as Response);

    global.fetch = mockFetch as unknown as typeof fetch;

    const { getListExampleGraphUrls } = await import('@/lib/example_graphs_cache');

    const result = await getListExampleGraphUrls();

    expect(result).toEqual(['/graphs/a.json', '/graphs/b.json', '/graphs/c.json']);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/graphs', { cache: 'no-store' });
  });

  it('throws when fetch returns non-ok status', async () => {
    const mockFetch = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue({ ok: false, status: 503 } as unknown as Response);

    global.fetch = mockFetch as unknown as typeof fetch;

    const { getListExampleGraphUrls } = await import('@/lib/example_graphs_cache');

    await expect(getListExampleGraphUrls()).rejects.toThrow('Failed to list graphs: 503');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/graphs', { cache: 'no-store' });
  });

  it('getExampleUrlsOnce dedupes concurrent loads and caches in-memory', async () => {
    // Ensure fresh module state
    jest.resetModules();

    const files = ['/graphs/a.json', '/graphs/b.json', '/graphs/a.json'];

    const mockFetch = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ files }),
      } as unknown as Response);

    global.fetch = mockFetch as unknown as typeof fetch;

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { getExampleUrlsOnce } = await import('@/lib/example_graphs_cache');

    // Two concurrent calls should share the same inflight promise and trigger only one fetch
    const [r1, r2] = await Promise.all([getExampleUrlsOnce(), getExampleUrlsOnce()]);

    expect(r1).toEqual(['/graphs/a.json', '/graphs/b.json']);
    expect(r2).toEqual(r1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenCalled();

    // Subsequent call should use in-memory cache and not call fetch again
    const before = mockFetch.mock.calls.length;
    const r3 = await getExampleUrlsOnce();
    expect(r3).toEqual(r1);
    expect(mockFetch).toHaveBeenCalledTimes(before);

    setItemSpy.mockRestore();
  });

  it('getExampleUrlsOnce returns stale cache immediately and refreshes in background', async () => {
    // Fresh state and clean storage
    jest.resetModules();
    window.localStorage.clear();

    // Seed stale cache in localStorage (very old timestamp)
    const stale = { data: ['/graphs/old.json'], ts: 0 };
    window.localStorage.setItem('exampleGraphs:v1:list', JSON.stringify(stale));

    // Prepare network to return a new list
    const files = ['/graphs/new.json', '/graphs/old.json'];
    const mockFetch = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ files }),
      } as unknown as Response);
    global.fetch = mockFetch as unknown as typeof fetch;

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { getExampleUrlsOnce } = await import('@/lib/example_graphs_cache');

    // First call should return stale cache immediately
    const first = await getExampleUrlsOnce();
    expect(first).toEqual(['/graphs/old.json']);

    // Allow background refresh to complete
    await Promise.resolve();
    await Promise.resolve();

    // Subsequent call should return updated list (deduped)
    const second = await getExampleUrlsOnce();
    expect(second).toEqual(['/graphs/new.json', '/graphs/old.json']);

    // Network called exactly once for the background refresh
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Verify persistence happened
    expect(setItemSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
  });

  it('getGraphByUrlOnce dedupes concurrent loads and caches in-memory', async () => {
    jest.resetModules();
    window.localStorage.clear();

    const graph = {
      metadata: { directed: false, weighted: false, name: 'g' },
      nodes: [],
      edges: [],
    };

    mockGraph = graph;

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { getGraphByUrlOnce } = await import('@/lib/example_graphs_cache');
    const { loadGraphFromUrl } = await import('../../lib/graph/loader');

    const url = '/graphs/a.json';

    const [g1, g2] = await Promise.all([
      getGraphByUrlOnce(url),
      getGraphByUrlOnce(url),
    ]);

    expect(g1).toEqual(graph);
    expect(g2).toEqual(graph);

    expect((loadGraphFromUrl as unknown as jest.Mock)).toHaveBeenCalledTimes(1);
    expect((loadGraphFromUrl as unknown as jest.Mock)).toHaveBeenCalledWith(url);

    // Subsequent call should use in-memory cache and not call loader again
    await getGraphByUrlOnce(url);
    expect((loadGraphFromUrl as unknown as jest.Mock)).toHaveBeenCalledTimes(1);

    expect(setItemSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it('getGraphByUrlOnce returns stale cached graph and refreshes in background', async () => {
    jest.resetModules();
    window.localStorage.clear();

    const url = '/graphs/stale.json';

    // Seed stale graph in localStorage using the storage key format
    const staleGraph = { metadata: { directed: true, weighted: false, name: 'old' }, nodes: [], edges: [] };
    const key = `exampleGraphs:v1:graph:${encodeURIComponent(url)}`;
    window.localStorage.setItem(key, JSON.stringify({ data: staleGraph, ts: 0 }));

    // Network (loader) will return a new updated graph
    const freshGraph = { metadata: { directed: false, weighted: true, name: 'new' }, nodes: [], edges: [] };
    mockGraph = freshGraph;

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { getGraphByUrlOnce } = await import('@/lib/example_graphs_cache');
    const { loadGraphFromUrl } = await import('../../lib/graph/loader');

    // First call returns stale graph immediately and triggers background refresh
    const first = await getGraphByUrlOnce(url);
    expect(first).toEqual(staleGraph);

    // Allow background refresh to settle
    await Promise.resolve();
    await Promise.resolve();

    // Subsequent call should return the fresh graph from in-memory cache
    const second = await getGraphByUrlOnce(url);
    expect(second).toEqual(freshGraph);

    expect((loadGraphFromUrl as unknown as jest.Mock)).toHaveBeenCalledTimes(1);
    expect((loadGraphFromUrl as unknown as jest.Mock)).toHaveBeenCalledWith(url);

    expect(setItemSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });
});
