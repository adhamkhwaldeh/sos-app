import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('Sample Test Suite', () => {
  test('renders correctly', () => {
    const { getByText } = render(<Text>Hello World</Text>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  test('basic math operations', () => {
    expect(1 + 1).toBe(2);
    expect(10 - 5).toBe(5);
    expect(2 * 3).toBe(6);
  });

  test('string operations', () => {
    const str = 'SOS App';
    expect(str).toContain('SOS');
    expect(str.length).toBe(7);
  });
});
