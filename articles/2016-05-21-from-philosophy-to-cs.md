---
layout: post
title: From Philosophy to Computer Science
date: 2016-05-21
description: When I say that I’m a software developer with a background in academic philosophy, many people react with surprise, as if I had jumped...
---
<p>
  <div class="fixed-img-spreader fifty">
    <div class="fixed-img-setter">
      <img src="{{ assets|key:'images/philosophy.jpg' }}"
        alt="The thinker"
        class="fixed-img">
    </div>
  </div>
</p>

When I say that I’m a software developer with a background in academic philosophy, many people react with surprise, as if I had jumped between completely divergent fields. Philosophy and computer science are in fact closely related and it is easy to transition from one to the other. In this article I would like to highlight a few reasons why this is so, with the hopes of dispelling the common misperception that they are opposites and of giving some background for students of philosophy who are interested in transitioning to computer science.

## Logical Similarities

The basis of both philosophy and computer science is logic. In philosophy, it’s often used to evaluate arguments, whereas in computer science, it is the means by which the processor is given instructions. Having a good grasp of logic’s core concepts is essential to do well in either.

Consider this example to see what I mean. Suppose I say,

> If Trump or Hillary wins, then all is lost.

This statement can be represented in philosophical notation as follows:

```
(1) (A ∨ B) → C
```

where `A` is "Trump wins", `B` is "Hillary wins", `C` is "All is lost," and  `∨` and `→` are shorthand for "or" and "If … then …," respectively.

Now let’s write a simple program that captures the content of our claim. Let’s make our computer print "All is lost," if either Hillary or Trump win, and print "Not all is lost," if neither of them wins.

```ruby
if trump_wins || hillary_wins
    print "All is lost."
else
    print "Not all is lost."
end
```

Cool. If we run this program after the election, it will print "All is lost," or "Not all is lost," depending on the result. Notice that, as far as the logic is concerned, we’ve used the exact same concepts that we used in expressing (1). The only difference is *syntax*. Here, the `→` is represented as a multi-line command and  `∨` is represented as `||`. The other addition that we’ve made is to add an imperative, namely, `print`. This is one of the main differences between pure logic and programming: Computers do things in the physical world; pure logic does not.

The advantage of a background in philosophy is that you are already able to translate colloquial statements into logical formulae, just as programmers do. As a student of philosophy, moreover, this kind of knowledge allows you to craft and criticize arguments. As a computer programmer, the same knowledge enables you to see several ways of building the same program; and the ability to see the far reaching, logical entailments of your claims often makes it easier to spot bugs.

## Analytical Similarities

The way that one evaluates a philosophical position is surprisingly similar to the way a computer processor evaluates code. Both involve analytically determining what follows from what.

Consider the position of utilitarianism. According to this view,

> What is good is what maximizes happiness. The virtuous choice is the one that maximizes happiness.

In order to evaluate this position, we need to consider its implications and ask if they are sound. If there is an unsound consequence, then the following logic will undermine the position. Schematically, where `¬` is 'not,' `A` is "What is good is what maximizes happiness," and `B` is some unsound consequence, we have:

```
Assume:            A → B
Assume:            A
By Modus Ponens:   B
Assume:           ¬B
By Modus Tollens: ¬A ∎
```

This argument shows that, if there is some unsound consequence `B`, then `A` cannot be true.

In computer programming, the style of thinking involved is remarkably similar. Suppose you are writing a computer program that plays chess and you need to write a function that checks the board to see if there is a checkmate. You might start out with something like this:

```ruby
def checkmate?
  if current_player.king.is_capturable?
    return true
  else
    return false
  end
end
```

This function checks to see if the current player's king can be captured. If it is, it returns `true`; otherwise, it returns `false`.

In order to evaluate this code, we perform a *mental stack trace*, that is, we imagine, as best we can, how the computer will process the code that we have just written. If our code is successful, all checkmated boards will be identified; otherwise, they won't be. Similarly, in the philosophical case, we evaluate our position by imagining all possible entailments. If our position is successful, we'll agree with all of the entailments; otherwise, we won't.

As it turns out, both of these cases are deficient. The problem with utilitarianism (at least in its current crude form) is that it ends up implying that slavery is not wrong, on the grounds that the intense suffering of the few may result in the highest levels of happiness for the many. This is unacceptable, so the argument above obtains. Analogously, the checkmate function will misidentify checked boards as being checkmated. The fact that the current player's king can be captured just means that she must move her king out of check, not that its capture is inevitable.

The point, however, is that both computer programming and philosophy involve analytically determining the consequences of one's statements; and both necessitate a certain creativity in subsequently modifying one's statements accordingly.

## Historical Development

Besides these concrete similarities, academic philosophy played a fascinating role in the historical development of computing.

The conceptual work that made the advent of modern computing possible took place in the early seventeen hundreds, when the philosopher and mathematician G.W.Leibniz developed an algebraic logic. In this logic, ones and zeros represent true or false states. The reason this is significant is that Leibniz’s ones and zeros would later be rendered mechanically as on or off switches in the first primitive computers. Although it took several hundred more years and the work of countless other philosophers, mathematicians, and engineers to develop our modern notion of computing, its conceptual foundation can be traced back to Leibniz’s philosophical logic.

The influence of philosophy on computer science did not stop at Leibniz, however. In the early nineteen hundreds, the philosophers Bertrand Russell and Alfred North Whitehead wrote *Principia Mathematica*, a nearly 2,000 page book written largely in formal logic that aimed to couch all of mathematics in terms of logic. Although the primary aim of this book was later demonstrated to be impossible by Gödel, the *Principia* also set out a theory of types that was later put to use by computer scientists. According to Constable’s brief history, Russell and Whitehead’s theory of types

> …provided a basis for both a precise semantics and elegant programming logics. It was in this context that computer scientists and logicians created the type theories that are deeply connected to *Principia Mathematica* and serve now as comprehensive logical accounts of computing, computational mathematics, and programming logics ([Constable](https://www.srcf.ucam.org/principia/files/rc.pdf) 3).

Today the influence of philosophy on computer science continues, especially in the ares of artificial intelligence, the representation of information, language, and other things.
