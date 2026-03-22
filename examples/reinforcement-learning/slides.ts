import { Deck } from "../../src/index.js";
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";

export default async function build() {
  const deck = new Deck(applyPreset(claudeDoc, macosNative));

  deck.title({
    title: "Reinforcement Learning",
    subtitle: "An Introduction for Undergraduates",
  });

  deck.section({ title: "What Is Reinforcement Learning?" });

  deck.content({
    title: "The Core Idea",
    bullets: [
      "An agent interacts with an environment over time",
      "Takes actions, observes states, receives rewards",
      "Goal: learn a policy that maximizes cumulative reward",
      "No labeled data — learns from trial and error",
    ],
  });

  deck.twoColumn({
    title: "RL vs Other Paradigms",
    leftTitle: "Supervised Learning",
    left: [
      "Labeled input-output pairs",
      "Learn a mapping function",
      "Static dataset",
    ],
    rightTitle: "Reinforcement Learning",
    right: [
      "Reward signal, not labels",
      "Learn a decision policy",
      "Sequential, interactive",
    ],
  });

  deck.section({ title: "Key Concepts" });

  deck.content({
    title: "The MDP Framework",
    bullets: [
      "States (S): where the agent can be",
      "Actions (A): what the agent can do",
      "Transitions P(s'|s,a): how the world changes",
      "Rewards R(s,a): immediate feedback signal",
      "Discount factor γ: how much to value future rewards",
    ],
  });

  await deck.equation({
    title: "The Bellman Equation",
    equations: [
      {
        latex: "V^\\pi(s) = \\sum_a \\pi(a|s) \\sum_{s'} P(s'|s,a) \\left[ R(s,a) + \\gamma\\, V^\\pi(s') \\right]",
        label: "Value function under policy π",
      },
      {
        latex: "Q^*(s,a) = \\sum_{s'} P(s'|s,a) \\left[ R(s,a) + \\gamma \\max_{a'} Q^*(s',a') \\right]",
        label: "Optimal action-value function",
      },
    ],
  });

  deck.content({
    title: "Classic Algorithms",
    bullets: [
      "Q-Learning: off-policy, tabular value iteration",
      "SARSA: on-policy temporal difference learning",
      "Policy Gradient: directly optimize the policy",
      "Deep Q-Networks (DQN): Q-learning with neural nets",
      "PPO / A3C: scalable policy gradient methods",
    ],
  });

  deck.code({
    title: "Q-Learning in Python",
    code: `import numpy as np

Q = np.zeros((n_states, n_actions))

for episode in range(1000):
    state = env.reset()
    while not done:
        action = epsilon_greedy(Q, state)
        next_state, reward, done = env.step(action)
        Q[state, action] += alpha * (
            reward + gamma * Q[next_state].max() - Q[state, action]
        )
        state = next_state`,
    language: "python",
  });

  deck.table({
    title: "Algorithm Comparison",
    headers: ["Algorithm", "Type", "Key Strength"],
    rows: [
      ["Q-Learning", "Value-based", "Simple, off-policy"],
      ["SARSA", "Value-based", "On-policy, safer exploration"],
      ["REINFORCE", "Policy gradient", "Works with continuous actions"],
      ["DQN", "Deep value-based", "Scales to high-dim states"],
      ["PPO", "Actor-critic", "Stable, widely used in practice"],
    ],
  });

  deck.quote({
    quote: "Reinforcement learning is the closest thing we have to a computational theory of intelligence.",
    attribution: "Rich Sutton",
  });

  deck.title({ title: "Questions?" });

  return deck;
}
