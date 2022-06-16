import { deepMerge } from '../../../src/lib/helpers';

describe('Helpers::deepMerge', () => {
  it('Helpers::deepMerge', () => {
    const target = {
      test: {
        value: {
          exists: true,
          untouched: true
        }
      },
      untouched: {
        'leave-me': {
          alone: true
        }
      },
      nothing: 'else'
    };

    const source = {
      test: {
        value: {
          exists: false
        }
      },
      alsoUntouched: {
        alone: true
      },
      matters: true
    };

    const result = {
      test: {
        value: {
          exists: false,
          untouched: true
        }
      },
      untouched: {
        'leave-me': {
          alone: true
        }
      },
      alsoUntouched: {
        alone: true
      },
      nothing: 'else',
      matters: true
    };

    expect(deepMerge(target, source)).toStrictEqual(result);
  });
});