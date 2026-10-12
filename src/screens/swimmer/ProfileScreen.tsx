import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, List, Switch, IconButton, Portal, Dialog } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import DemoAccountSwitcher from '../../components/DemoAccountSwitcher';
import DeleteAccountSection from '../../components/DeleteAccountSection';
import BadgeChip from '../../components/BadgeChip';
import XPBar from '../../components/XPBar';
import StreakFlame from '../../components/StreakFlame';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { useGamification } from '../../hooks';
import { clubService, groupService, profileService } from '../../services';
import { computeEarnedBadges } from '../../services/gamificationService';
import { BADGE_CATALOG } from '../../config/badges';
import { XP_RULES } from '../../config/gamification';
import { Club } from '../../types';

export default function SwimmerProfileScreen({ navigation }: { navigation: any }) {
  const { profile, user, clubId, signOut } = useAuthStore();
  const [club, setClub] = useState<Club | null>(null);
  const [groupNames, setGroupNames] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [xpInfoVisible, setXpInfoVisible] = useState(false);

  const gamification = useGamification(user?.id);
  const earnedIds = new Set(computeEarnedBadges(gamification).map((b) => b.id));

  const loadInfo = useCallback(async () => {
    if (!user) return;
    try {
      if (clubId) {
        const clubData = await clubService.getById(clubId);
        setClub(clubData);
      }
      const groups = await groupService.getBySwimmer(user.id);
      setGroupNames(groups.map((g) => g.name));
    } catch (err) {
      console.error('Error loading profile info:', err);
    }
  }, [user, clubId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInfo();
    setRefreshing(false);
  }, [loadInfo]);

  useFocusEffect(
    useCallback(() => {
      loadInfo();
    }, [loadInfo]),
  );

  return (
    <GradientScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {profile?.first_name} {profile?.last_name}
          </Text>
          <Text variant="bodyMedium" style={styles.role}>
            Nageur
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Email"
              description={user?.email}
              left={(props) => <List.Icon {...props} icon="email" />}
              titleStyle={{ color: '#1e293b' }}
              descriptionStyle={{ color: '#64748b' }}
            />
            <List.Item
              title="Membre depuis"
              description={new Date(profile?.created_at || '').toLocaleDateString('fr-FR')}
              left={(props) => <List.Icon {...props} icon="calendar" />}
              titleStyle={{ color: '#1e293b' }}
              descriptionStyle={{ color: '#64748b' }}
            />
          </Card.Content>
        </Card>

        {club ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: '#1e293b' }}>Mon club</Text>
              <List.Item
                title={club.name}
                description={club.description || undefined}
                left={(props) => <List.Icon {...props} icon="shield-outline" />}
                titleStyle={{ color: '#1e293b' }}
                descriptionStyle={{ color: '#64748b' }}
              />
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.joinCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.joinTitle}>
                Rejoindre un club
              </Text>
              <Text variant="bodyMedium" style={styles.joinSubtitle}>
                Saisis le code d'invitation donné par ton coach.
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('JoinClub')}
                style={styles.joinBtn}
                icon="key-outline"
              >
                Entrer un code d'invitation
              </Button>
            </Card.Content>
          </Card>
        )}

        {groupNames.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: '#1e293b' }}>Mes groupes</Text>
              {groupNames.map((name) => (
                <List.Item
                  key={name}
                  title={name}
                  left={(props) => <List.Icon {...props} icon="account-group" />}
                  titleStyle={{ color: '#1e293b' }}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Progression & badges */}
        {gamification.totalSessions > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.badgesHeader}>
                <Text variant="titleMedium" style={{ color: '#1e293b' }}>
                  Ma progression
                </Text>
                <IconButton
                  icon="information-outline"
                  size={18}
                  onPress={() => setXpInfoVisible(true)}
                  style={{ margin: 0 }}
                />
              </View>
              <View style={styles.gamifRow}>
                <View style={{ flex: 1 }}>
                  <XPBar
                    currentXP={gamification.levelInfo.currentXP}
                    nextLevelXP={gamification.levelInfo.nextLevelXP}
                    level={gamification.levelInfo.level}
                  />
                </View>
                <StreakFlame count={gamification.streakWeeks} label="sem." />
              </View>

              <Text variant="titleMedium" style={styles.badgesTitle}>
                Mes badges
              </Text>
              <View style={styles.badgesGrid}>
                {BADGE_CATALOG.map((badge) => (
                  <BadgeChip
                    key={badge.id}
                    name={badge.name}
                    tier={badge.tier}
                    icon={badge.icon as any}
                    locked={!earnedIds.has(badge.id)}
                  />
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#1e293b' }}>Notifications</Text>
            <List.Item
              title="Rappels d'entraînement"
              description="1 h avant chaque séance"
              left={(props) => <List.Icon {...props} icon="bell-outline" />}
              titleStyle={{ color: '#1e293b' }}
              descriptionStyle={{ color: '#64748b' }}
              right={() => (
                <Switch
                  value={profile?.notification_reminder ?? true}
                  onValueChange={async (val) => {
                    if (!user) return;
                    try {
                      await profileService.update(user.id, { notification_reminder: val });
                      useAuthStore.getState().fetchProfile();
                    } catch {}
                  }}
                />
              )}
            />
            <List.Item
              title="Demandes de feedback"
              description="Après chaque émargement"
              left={(props) => <List.Icon {...props} icon="comment-outline" />}
              titleStyle={{ color: '#1e293b' }}
              descriptionStyle={{ color: '#64748b' }}
              right={() => (
                <Switch
                  value={profile?.notification_feedback ?? true}
                  onValueChange={async (val) => {
                    if (!user) return;
                    try {
                      await profileService.update(user.id, { notification_feedback: val });
                      useAuthStore.getState().fetchProfile();
                    } catch {}
                  }}
                />
              )}
            />
          </Card.Content>
        </Card>

        <DemoAccountSwitcher />

        <Button
          mode="outlined"
          onPress={signOut}
          style={styles.logoutButton}
          textColor="#EF4444"
          icon="logout"
        >
          Se déconnecter
        </Button>

        <DeleteAccountSection />
      </ScrollView>

      {/* Explication du systeme XP */}
      <Portal>
        <Dialog visible={xpInfoVisible} onDismiss={() => setXpInfoVisible(false)}>
          <Dialog.Title>Comment gagner de l'XP ?</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.xpInfoLine}>+{XP_RULES.perSession} XP par séance assistée</Text>
            <Text style={styles.xpInfoLine}>+{XP_RULES.perFeedback} XP par feedback envoyé</Text>
            <Text style={styles.xpInfoLine}>
              +{XP_RULES.perStreakWeek} XP par semaine de streak en cours
            </Text>
            <Text style={styles.xpInfoLine}>+{XP_RULES.per100m} XP par 100 m nagés</Text>
            <Text style={styles.xpInfoHint}>
              Le streak compte les semaines consécutives avec au moins une séance : une semaine sans nager le remet à zéro.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setXpInfoVisible(false)}>Compris !</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    backgroundColor: '#ec4899',
  },
  name: {
    marginTop: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  role: {
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 16,
  },
  joinCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
  },
  joinTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  joinSubtitle: {
    color: '#64748b',
    marginBottom: 12,
  },
  joinBtn: {
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#EF4444',
  },
  // Gamification
  badgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gamifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  badgesTitle: {
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  xpInfoLine: {
    color: '#1e293b',
    fontSize: 14,
    marginBottom: 6,
  },
  xpInfoHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 17,
  },
});
