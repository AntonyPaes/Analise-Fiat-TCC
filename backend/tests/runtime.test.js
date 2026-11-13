describe('Inicialização do servidor com dependências simuladas', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    jest.dontMock('../app');
    jest.dontMock('../config/database');
    jest.dontMock('../config/seed');
  });
  test.each(['sucesso', 'falha de conexão', 'falha de seed'])('inicialização: %s', async mode => {
    const listen = jest.fn();
    const sync = mode === 'falha de conexão' ? jest.fn().mockRejectedValue(new Error('offline')) : jest.fn().mockResolvedValue();
    const seed = mode === 'falha de seed' ? jest.fn().mockRejectedValue(new Error('seed')) : jest.fn().mockResolvedValue();
    jest.doMock('../app', () => ({ listen }));
    jest.doMock('../config/database', () => ({ sync }));
    jest.doMock('../config/seed', () => seed);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    require('../server');
    await new Promise(resolve => setImmediate(resolve));
    expect(sync).toHaveBeenCalledWith({ force: false });
    if (mode === 'sucesso') {
      expect(seed).toHaveBeenCalledTimes(1);
      expect(listen).toHaveBeenCalledWith(process.env.PORT || 3000, expect.any(Function));
      listen.mock.calls[0][1]();
      expect(error).not.toHaveBeenCalled();
    } else {
      expect(listen).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    }
  });
});
