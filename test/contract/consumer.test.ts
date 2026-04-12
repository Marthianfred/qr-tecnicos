/**
 * @jest-environment node
 */
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import { apiService, setApiBaseUrl } from '../../src/ui/services/api';

const provider = new PactV3({
  consumer: 'Frontend',
  provider: 'Backend',
  dir: './pacts',
});

describe('Pact Consumer Test', () => {
  it('should fetch a technician by ID', async () => {
    const technicianId = '1';
    
    provider
      .given('a technician exists with ID 1')
      .uponReceiving('a request for a technician')
      .withRequest({
        method: 'GET',
        path: `/api/tecnicos/${technicianId}`,
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: MatchersV3.equal('1'),
          nombre: MatchersV3.like('John Doe'),
          documento: MatchersV3.like('12345678'),
          pais: MatchersV3.like('Venezuela'),
          status: MatchersV3.like('activo'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      setApiBaseUrl(mockServer.url + '/api');
      const technician = await apiService.getTechnician(technicianId);
      expect(technician.id).toBe('1');
      expect(technician.nombre).toBe('John Doe');
    });
  });

  it('should generate a QR token for a technician', async () => {
    const technicianId = '1';

    provider
      .given('a technician exists with ID 1')
      .uponReceiving('a request to generate a QR token')
      .withRequest({
        method: 'POST',
        path: `/api/tecnicos/${technicianId}/qr`,
      })
      .willRespondWith({
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: {
          qr_token: MatchersV3.like('some-token-abc'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      setApiBaseUrl(mockServer.url + '/api');
      const response = await apiService.generateQR(technicianId);
      expect(response.qr_token).toBeDefined();
    });
  });

  it('should validate a QR token', async () => {
    const token = 'valid-token';

    provider
      .uponReceiving('a request to validate a QR token')
      .withRequest({
        method: 'GET',
        path: `/api/tecnicos/validate/${token}`,
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: MatchersV3.like('1'),
          nombre: MatchersV3.like('John Doe'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      setApiBaseUrl(mockServer.url + '/api');
      const response = await apiService.validateQR(token);
      expect(response.id).toBeDefined();
    });
  });

  it('should report an inconsistency', async () => {
    const technicianId = '1';
    const report = { reason: 'Foto no coincide', details: 'La foto es vieja' };

    provider
      .given('a technician exists with ID 1')
      .uponReceiving('a request to report an inconsistency')
      .withRequest({
        method: 'POST',
        path: `/api/tecnicos/${technicianId}/report`,
        headers: { 'Content-Type': 'application/json' },
        body: {
          descripcion: report.reason,
          detalles: report.details,
        },
      })
      .willRespondWith({
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: MatchersV3.like('100'),
          descripcion: MatchersV3.like('Foto no coincide'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      setApiBaseUrl(mockServer.url + '/api');
      const response = await apiService.reportInconsistency(technicianId, report);
      expect(response.id).toBeDefined();
    });
  });
});
