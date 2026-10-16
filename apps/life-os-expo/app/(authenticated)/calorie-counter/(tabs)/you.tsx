import { useState } from "react";
import type { ReactNode } from "react";
import { api } from "@transcend/convex";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Sortable from "react-native-sortables";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CalorieAppHeader from "@/components/calories/CalorieAppHeader";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";

type FriendsData = NonNullable<
  FunctionReturnType<typeof api.friends.listFriends.listFriends>
>;
type FriendEntry = FriendsData["friends"][number];

const inputStyle = {
  flex: 1,
  color: "#F9FAFB",
  borderBottomWidth: 1,
  borderBottomColor: "#374151",
  fontFamily: appFonts.regular,
  fontSize: 16,
  lineHeight: 22,
  paddingVertical: 8,
} as const;

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function nameOf(entry: { displayName: string | null }) {
  return entry.displayName ?? "Unnamed";
}

function SmallButton({
  label,
  onPress,
  disabled,
  primary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: 36,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: primary ? 0 : 1,
        borderColor: "#374151",
        backgroundColor: primary ? "#F3F4F6" : "transparent",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : pressed ? 0.72 : 1,
      })}
    >
      <Text type="text-semibold" color={primary ? "#111827" : "#FFFFFF"}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text type="text-semibold" style={{ marginTop: 32, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

function DisplayNameEditor({
  initialName,
  onDone,
}: {
  initialName: string;
  onDone?: () => void;
}) {
  const setDisplayName = useMutation(api.profile.setDisplayName);
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await setDisplayName({ displayName: name });
      onDone?.();
    } catch (saveError) {
      setError(errorMessage(saveError, "Could not save name"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={40}
          placeholder="Display name"
          placeholderTextColor="#6B7280"
          accessibilityLabel="Display name"
          autoCapitalize="words"
          editable={!saving}
          onSubmitEditing={() => void onSave()}
          style={inputStyle}
        />
        <SmallButton
          label={saving ? "Saving..." : "Save"}
          onPress={() => void onSave()}
          disabled={saving}
          primary
        />
      </View>
      {error ? (
        <Text type="text-detail" color="#F87171">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function AddFriendForm() {
  const sendFriendRequest = useMutation(
    api.friends.sendFriendRequest.sendFriendRequest,
  );
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  const onSend = async () => {
    if (sending) return;
    setSending(true);
    setMessage(null);
    try {
      const result = await sendFriendRequest({ email });
      setEmail("");
      setMessage({
        text:
          result.status === "accepted"
            ? "You're now friends."
            : "If that email has an account, they'll get your request.",
        error: false,
      });
    } catch (sendError) {
      setMessage({
        text: errorMessage(sendError, "Could not send request"),
        error: true,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="friend@email.com"
          placeholderTextColor="#6B7280"
          accessibilityLabel="Friend's email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          inputMode="email"
          editable={!sending}
          onSubmitEditing={() => void onSend()}
          style={inputStyle}
        />
        <SmallButton
          label={sending ? "Sending..." : "Send"}
          onPress={() => void onSend()}
          disabled={sending || !email.trim()}
          primary
        />
      </View>
      {message ? (
        <Text type="text-detail" color={message.error ? "#F87171" : "#9CA3AF"}>
          {message.text}
        </Text>
      ) : null}
    </View>
  );
}

function PersonRow({
  entry,
  children,
}: {
  entry: FriendEntry;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: "#1F2937",
      }}
    >
      <Ionicons name="person-circle-outline" size={24} color="#9CA3AF" />
      <Text type="text-medium" style={{ flex: 1 }}>
        {nameOf(entry)}
      </Text>
      {children}
    </View>
  );
}

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const data = useQuery(api.friends.listFriends.listFriends);
  const respond = useMutation(
    api.friends.respondToFriendRequest.respondToFriendRequest,
  );
  const removeFriend = useMutation(api.friends.removeFriend.removeFriend);
  const reorderFriends = useMutation(
    api.friends.reorderFriends.reorderFriends,
  ).withOptimisticUpdate((localStore, args) => {
    const current = localStore.getQuery(
      api.friends.listFriends.listFriends,
      {},
    );
    if (!current) return;
    const rank = new Map(args.profileIds.map((id, index) => [id, index]));
    localStore.setQuery(
      api.friends.listFriends.listFriends,
      {},
      {
        ...current,
        friends: [...current.friends].sort(
          (a, b) =>
            (rank.get(a.profileId) ?? Infinity) -
            (rank.get(b.profileId) ?? Infinity),
        ),
      },
    );
  });
  const { width: screenWidth } = useWindowDimensions();
  // Rows need an explicit width inside Sortable.Flex; content is capped at
  // 640px with 20px horizontal padding on each side.
  const rowWidth = Math.max(Math.min(screenWidth, 640) - 40, 0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);

  const run = (
    id: string,
    action: () => Promise<unknown>,
    fallback: string,
  ) => {
    if (busyId) return;
    setBusyId(id);
    void action()
      .catch((error: unknown) =>
        Alert.alert(fallback, errorMessage(error, fallback)),
      )
      .finally(() => setBusyId(null));
  };

  const confirmRemove = (entry: FriendEntry) => {
    Alert.alert(
      "Remove friend?",
      `You and ${nameOf(entry)} will stop seeing each other in the feed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            run(
              entry.friendshipId,
              () => removeFriend({ friendshipId: entry.friendshipId }),
              "Could not remove friend",
            ),
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          width: "100%",
          maxWidth: 640,
          alignSelf: "center",
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 36,
        }}
      >
        <CalorieAppHeader title="You" />

        {data === undefined ? (
          <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 24 }}>
            Loading...
          </Text>
        ) : data === null ? (
          <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 24 }}>
            Sign in to add friends.
          </Text>
        ) : !data.me.displayName ? (
          <View style={{ marginTop: 24, gap: 12 }}>
            <Text type="text-semibold">Choose a display name</Text>
            <Text type="text-detail" color="#9CA3AF">
              This is how friends will see you in the feed.
            </Text>
            <DisplayNameEditor initialName="" />
          </View>
        ) : (
          <>
            <View style={{ marginTop: 24, gap: 8 }}>
              <Text type="text-detail" color="#9CA3AF">
                Display name
              </Text>
              {editingName ? (
                <DisplayNameEditor
                  initialName={data.me.displayName}
                  onDone={() => setEditingName(false)}
                />
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text type="text-semibold">{data.me.displayName}</Text>
                  <SmallButton
                    label="Edit"
                    onPress={() => setEditingName(true)}
                  />
                </View>
              )}
            </View>

            <SectionTitle>Add a friend by email</SectionTitle>
            <AddFriendForm />

            {data.incoming.length > 0 ? (
              <>
                <SectionTitle>Requests</SectionTitle>
                {data.incoming.map((entry) => (
                  <PersonRow key={entry.friendshipId} entry={entry}>
                    <SmallButton
                      label="Decline"
                      disabled={busyId !== null}
                      onPress={() =>
                        run(
                          entry.friendshipId,
                          () =>
                            respond({
                              friendshipId: entry.friendshipId,
                              accept: false,
                            }),
                          "Could not decline request",
                        )
                      }
                    />
                    <SmallButton
                      label="Accept"
                      primary
                      disabled={busyId !== null}
                      onPress={() =>
                        run(
                          entry.friendshipId,
                          () =>
                            respond({
                              friendshipId: entry.friendshipId,
                              accept: true,
                            }),
                          "Could not accept request",
                        )
                      }
                    />
                  </PersonRow>
                ))}
              </>
            ) : null}

            <SectionTitle>Friends</SectionTitle>
            {data.friends.length === 0 ? (
              <Text type="text-detail" color="#6B7280">
                No friends yet
              </Text>
            ) : (
              <>
                <Text
                  type="text-detail"
                  color="#6B7280"
                  style={{ marginBottom: 8 }}
                >
                  Hold and drag to reorder. Your feed uses this order.
                </Text>
                <View style={{ width: "100%", alignSelf: "stretch" }}>
                  <Sortable.Flex
                    flexDirection="column"
                    flexWrap="nowrap"
                    itemEntering={null}
                    itemExiting={null}
                    itemsLayoutTransitionMode="reorder"
                    dragActivationDelay={220}
                    width="fill"
                    enableActiveItemSnap={false}
                    activeItemScale={1.03}
                    onDragEnd={({ order }) => {
                      const nextFriends = order(data.friends);
                      void reorderFriends({
                        profileIds: nextFriends.map(
                          (friend) => friend.profileId,
                        ),
                      });
                    }}
                  >
                    {data.friends.map((entry) => (
                      <View
                        key={entry.friendshipId}
                        style={{ width: rowWidth, backgroundColor: "black" }}
                      >
                        <PersonRow entry={entry}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${nameOf(entry)}`}
                            disabled={busyId !== null}
                            hitSlop={8}
                            onPress={() => confirmRemove(entry)}
                            style={{ padding: 6 }}
                          >
                            <Ionicons
                              name="person-remove-outline"
                              size={18}
                              color="#9CA3AF"
                            />
                          </Pressable>
                        </PersonRow>
                      </View>
                    ))}
                  </Sortable.Flex>
                </View>
              </>
            )}

            {data.outgoing.length > 0 ? (
              <>
                <SectionTitle>Sent</SectionTitle>
                {data.outgoing.map((entry) => (
                  <PersonRow key={entry.friendshipId} entry={entry}>
                    <SmallButton
                      label="Cancel"
                      disabled={busyId !== null}
                      onPress={() =>
                        run(
                          entry.friendshipId,
                          () =>
                            removeFriend({ friendshipId: entry.friendshipId }),
                          "Could not cancel request",
                        )
                      }
                    />
                  </PersonRow>
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
