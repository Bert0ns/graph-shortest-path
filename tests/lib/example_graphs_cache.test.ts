// We import inside the test after stubbing fetch to ensure the function uses our mock

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
});
