import { describe, expect, it } from 'vitest';
import { DEFAULT_MODEL_ID, getModelRegistry } from '../src/model.js';

describe('model registry', () => {
    it('includes a procedural virtual room for color theory lighting tests', () => {
        const room = getModelRegistry().find(model => model.id === 'virtual_room');

        expect(room).toBeDefined();
        expect(room.kind).toBe('proceduralRoom');
        expect(room.hideBase).toBe(true);
        expect(room.description.es).toContain('sala');
    });

    it('localizes the virtual room name and description', () => {
        const room = getModelRegistry('en').find(model => model.id === 'virtual_room');

        expect(room.name).toBe('Ideal Color Room');
        expect(room.description).toContain('virtual room');
    });

    it('uses the virtual room as the default model', () => {
        expect(DEFAULT_MODEL_ID).toBe('virtual_room');
    });
});
