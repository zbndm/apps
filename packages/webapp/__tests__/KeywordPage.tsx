import React from 'react';
import nock from 'nock';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { LoggedUser, Roles } from '@dailydotdev/shared/src/lib/user';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Keyword,
  KeywordData,
  KEYWORD_QUERY,
} from '@dailydotdev/shared/src/graphql/keywords';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import KeywordsPage from '../pages/backoffice/keywords/[value]';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const routerReplace = jest.fn();

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        replace: routerReplace,
      } as unknown as NextRouter),
  );
});

const defaultUser: LoggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '',
  roles: [Roles.Moderator],
};

const defaultKeyword: Keyword = {
  value: 'reactjs',
  occurrences: 10,
  status: 'allow',
};

const createKeywordMock = (
  keyword: Keyword | null = defaultKeyword,
): MockedGraphQLResponse<KeywordData> => ({
  request: {
    query: KEYWORD_QUERY,
    variables: {
      value: defaultKeyword.value,
    },
  },
  result: {
    data: { keyword },
  },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createKeywordMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
        }}
      >
        <KeywordsPage keyword={defaultKeyword.value} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should redirect to home page if not moderator', async () => {
  renderComponent([], { ...defaultUser, roles: [] });
  await waitFor(() => expect(routerReplace).toBeCalledWith('/'));
});

it('should show 404 when no keyword', async () => {
  renderComponent([createKeywordMock(null)]);
  expect(await screen.findByTestId('notFound')).toBeInTheDocument();
});

it('should show the keyword', async () => {
  renderComponent();
  expect(await screen.findByText('reactjs')).toBeInTheDocument();
});

it('should show the status', async () => {
  renderComponent();
  const el = await screen.findByText('Status: allow');
  expect(el).toBeInTheDocument();
});
