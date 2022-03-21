import React, {createContext, useContext, useState} from 'react';
import {User} from '../api/types';

// UserContext의 값은 값, 업데이터 함수 타입을 지닙니다.
// useState를 통해 반환된 값을 그대로 UserContext에 담는다.
type UserContextState = [User | null, (user: User | null) => void];

const UserContext = createContext<UserContextState | null>(null);

export function UserContextProvider({children}: {children: React.ReactNode}) {
  const userState = useState<User | null>(null);
  return (
    <UserContext.Provider value={userState}>{children}</UserContext.Provider>
  );
}

// context를 추후 더 편하게 사용할 수 있게 만드는 훅
export function useUserState() {
  const userState = useContext(UserContext);
  if (!userState) {
    throw new Error('UserContext is not used');
  }
  return userState;
}
