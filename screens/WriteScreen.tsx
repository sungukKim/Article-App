import {Article} from '../api/types';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/core';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackNavigationProp, RootStackParamList} from './types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  InfiniteData,
  QueryClient,
  useMutation,
  useQueryClient,
} from 'react-query';
import {modifyArticle, writeArticle} from '../api/articles';
import article from '../articles-server/src/api/article/controllers/article';

type WriteScreenRouteProp = RouteProp<RootStackParamList, 'write'>;

function WriteScreen() {
  const {params} = useRoute<WriteScreenRouteProp>();
  const queryClient = useQueryClient();
  const cachedArticle = useMemo(
    () =>
      params.articleId
        ? queryClient.getQueriesData<Article>(['article', params.articleId])
        : null,
    [queryClient, params.articleId],
  );
  const {top} = useSafeAreaInsets();
  const [title, setTitle] = useState(cachedArticle?.title ?? '');
  const [body, setBody] = useState(cachedArticle?.body ?? '');
  const {mutate: write} = useMutation(writeArticle, {
    onSuccess: article => {
      queryClient.setQueryData<InfiniteData<Article[]>>('articles', data => {
        if (!data) {
          return {
            pageParams: [undefined],
            pages: [[article]],
          };
        }
        const [firstPage, ...rest] = data.pages;
        return {
          ...data,
          pages: [[article, ...firstPage], ...rest],
        };
      });
      navigation.goBack();
    },
  });
  const {mutate: modify} = useMutation(modifyArticle, {
    onSuccess: article => {
      queryClient.setQueryData<InfiniteData<Article[]>>('articles', data => {
        if (!data) {
          return {pageParams: [], pages: []};
        }

        return {
          pageParams: data!.pageParams,
          pages: data!.pages.map(page =>
            page.find(a => a.id === params.articleId)
              ? page.map(a => (a.id === params.articleId ? article : a))
              : page,
          ),
        };
      });
      QueryClient.setQueryData(['article', params.articleId], article);
      navigation.goBack();
    },
  });

  const navigation = useNavigation<RootStackNavigationProp>();
  const onSubmit = useCallback(() => {
    if (params.articleId) {
      modify({id: params.articleId, title, body});
    } else {
      write({title, body});
    }
  }, [write, modify, title, body, params.articleId]);

  useEffect(() => {
    navigation.setOptions({
      headerRightContainerStyle: styles.headerRightContainer,
      headerRight: () => (
        <Pressable
          hitSlop={8}
          onPress={onSubmit}
          style={({pressed}) => pressed && styles.headerRightPressed}>
          <MaterialIcons name="send" color="#2196f3" size={24} />
        </Pressable>
      ),
    });
  }, [onSubmit, navigation]);

  return (
    <SafeAreaView style={styles.block} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.KeyboardAvoiding}
        behavior={Platform.select({ios: 'padding'})}
        keyboardVerticalOffset={Platform.select({ios: top + 60})}>
        <TextInput
          placeholder="제목"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="내용"
          style={[styles.input, styles.body]}
          multiline
          textAlignVertical="top"
          value={body}
          onChangeText={setBody}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexDirection: 'column',
  },
  KeyboardAvoiding: {
    flex: 1,
  },
  input: {
    backgroundColor: 'white',
    fontSize: 14,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
  },
  body: {
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 16,
    flex: 1,
  },
  headerRightContainer: {
    marginRight: 16,
  },
  headerRightPressed: {
    opacity: 0.75,
  },
});

export default WriteScreen;
