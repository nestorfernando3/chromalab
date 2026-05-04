import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LessonProgressEngine } from '../src/lessonProgress.js';
import { appEvents } from '../src/utils/events.js';

describe('LessonProgressEngine', () => {
    let engine;
    let listeners = {};

    beforeEach(() => {
        localStorage.clear();
        engine = new LessonProgressEngine();
        listeners = {};
    });

    afterEach(() => {
        engine.destroy();
        Object.entries(listeners).forEach(([event, fn]) => {
            appEvents.off(event, fn);
        });
    });

    function listen(event) {
        const fn = vi.fn();
        appEvents.on(event, fn);
        listeners[event] = fn;
        return fn;
    }

    describe('registerLesson', () => {
        it('emits initial completion state', () => {
            const fn = listen('lesson:completionChanged');
            engine.registerLesson('hsv', [
                { id: 'a', event: 'color:hueChanged', required: true }
            ]);
            expect(fn).toHaveBeenCalledWith(expect.objectContaining({
                lessonId: 'hsv',
                completed: false,
                percent: 0
            }));
        });
    });

    describe('criteria completion', () => {
        it('marks criterion completed on matching event', () => {
            engine.registerLesson('hsv', [
                { id: 'adjust-hue', event: 'color:hueChanged', required: true }
            ]);
            appEvents.emit('color:hueChanged', { lessonId: 'hsv', hue: 200 });
            expect(engine.isCompleted('adjust-hue')).toBe(true);
        });

        it('emits criteriaCompleted event', () => {
            const fn = listen('lesson:criteriaCompleted');
            engine.registerLesson('hsv', [
                { id: 'adjust-hue', event: 'color:hueChanged', required: true }
            ]);
            appEvents.emit('color:hueChanged', { lessonId: 'hsv', hue: 200 });
            expect(fn).toHaveBeenCalledWith({ lessonId: 'hsv', criteriaId: 'adjust-hue' });
        });

        it('does not double-count the same criterion', () => {
            engine.registerLesson('hsv', [
                { id: 'adjust-hue', event: 'color:hueChanged', required: true }
            ]);
            appEvents.emit('color:hueChanged', { lessonId: 'hsv', hue: 200 });
            appEvents.emit('color:hueChanged', { lessonId: 'hsv', hue: 220 });
            expect(engine.getCompletedCriteria('hsv')).toHaveLength(1);
        });
    });

    describe('completion rules', () => {
        it('marks lesson complete when all required criteria met', () => {
            const fn = listen('lesson:completionChanged');
            engine.registerLesson('hsv', [
                { id: 'adjust-hue', event: 'color:hueChanged', required: true },
                { id: 'adjust-saturation', event: 'color:saturationChanged', required: true }
            ], { mode: 'allRequired' });

            appEvents.emit('color:hueChanged', { lessonId: 'hsv' });
            expect(fn).toHaveBeenLastCalledWith(expect.objectContaining({ completed: false }));

            appEvents.emit('color:saturationChanged', { lessonId: 'hsv' });
            expect(fn).toHaveBeenLastCalledWith(expect.objectContaining({ completed: true }));
        });

        it('ignores optional criteria for completion', () => {
            const fn = listen('lesson:completionChanged');
            engine.registerLesson('hsv', [
                { id: 'adjust-hue', event: 'color:hueChanged', required: true },
                { id: 'adjust-intensity', event: 'light:intensityChanged', required: false }
            ], { mode: 'allRequired' });

            appEvents.emit('color:hueChanged', { lessonId: 'hsv' });
            expect(fn).toHaveBeenLastCalledWith(expect.objectContaining({ completed: true }));
        });
    });

    describe('observation rule', () => {
        it('marks write-observation when minObservationLength met', () => {
            engine.registerLesson('hsv', [
                { id: 'write-observation', event: 'lesson:responseChanged', required: true }
            ], { mode: 'allRequired', minObservationLength: 10 });

            engine.setObservation('hsv', 'Short');
            expect(engine.isCompleted('write-observation')).toBe(false);

            engine.setObservation('hsv', 'This is long enough');
            expect(engine.isCompleted('write-observation')).toBe(true);
        });
    });

    describe('persistence', () => {
        it('survives reset and re-registration', () => {
            engine.registerLesson('hsv', [
                { id: 'adjust-hue', event: 'color:hueChanged', required: true }
            ]);
            appEvents.emit('color:hueChanged', { lessonId: 'hsv', hue: 200 });

            // Verify localStorage was written
            const raw = localStorage.getItem('chromaLab.lessonProgress.v1');
            expect(raw).toBeTruthy();
            const data = JSON.parse(raw);
            expect(data.criteria.hsv).toContain('adjust-hue');

            const engine2 = new LessonProgressEngine();
            engine2.registerLesson('hsv', [
                { id: 'adjust-hue', event: 'color:hueChanged', required: true }
            ]);
            expect(engine2.isCompleted('adjust-hue')).toBe(true);
            engine2.destroy();
        });
    });
});
