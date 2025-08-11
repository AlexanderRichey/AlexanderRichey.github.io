---
title: Notes on Ben Orenstein’s “Refactoring from Good to Great”
date: 2021-04-01
description: I watched Ben Orenstein’s talk “Refactoring from Good to Great” at the beginning of my career and it made big and, I think, positive...
---

<div class="message">
I watched Ben Orenstein's <a href="https://youtu.be/DC-pQPq0acs" target="_blank">talk "Refactoring from Good to Great"</a> at the beginning of my career and it made big and, I think, positive impact on how I write code. Here are some notes I took on the original talk to make its content easier to share.
</div>

Don't think of the following advice as absolute truth. Some advice may make sense in some cases. Some advice may not. Use your own best judgement.

## Method Extraction

Consider the following code. It's decent, but how could it be made better?

```ruby
require 'date'
require 'ostruct'

class OrdersReport
 def initialize(orders, start_date, end_date)
   @orders = orders
   @start_date = start_date
   @end_date = end_date
 end

 def total_sales_within_date_range
   orders_within_range =
     @orders.select { |order| order.placed_at >= @start_date &&
                              order.placed_at <= @end_date }

   orders_within_range.
     map(&:amount).inject(0) { |sum, amount| amount + sum }
 end
end

class Order < OpenStruct
end
```

One thing we can do is extract a new method, `orders_within_range()`, like so.

```ruby {hl_lines=[12, "16-21"]}
require 'date'
require 'ostruct'

class OrdersReport
 def initialize(orders, start_date, end_date)
   @orders = orders
   @start_date = start_date
   @end_date = end_date
 end

 def total_sales_within_date_range
   orders_within_range.
     map(&:amount).inject(0) { |sum, amount| amount + sum }
  end

  private

  def orders_within_range
    @orders.select { |order| order.placed_at >= @start_date &&
                             order.placed_at <= @end_date }
  end
end

class Order < OpenStruct
end
```

There are three upshots to this refactor.

- We go from one method with two lines to two methods with just one line each. Changes like this aren't always improvements, but they usually are, since they result in methods that are more focused.
- This refactor makes it more likely for this code to be reused rather than rewritten by another developer.
- This refactor causes readers of this code to focus on business logic, rather than incidental details. It "gives a hint" to readers that `orders_within_range()` isn't important to what this report is about.

These wins are small, but, in aggregate, they're worth doing.

## Tell; Don't Ask

There's another problem with this code, which is that it violates the *tell-dont-ask* principle. This principle isn't a law. It's a maxim that, when followed, can sometimes (but not always) lead to better code. Here's the principle:

> It's generally better to send a message to an object and have it perform work than to ask an object about its internal state and decide what work to do on its behalf.

We violate this principle in our new helper method when we ask `order` about its internal state.

```ruby
def orders_within_range
  @orders.select { |order| order.placed_at >= @start_date &&
                           order.placed_at <= @end_date }
end
```

This code can be improved by refactoring it in the following way.

```ruby {hl_lines=[5, "10-12"]}
class OrdersReport
  ...
  
  def orders_within_range
    @orders.select { |order| order.placed_between?(start_date, end_date) }
  end
end

class Order < OpenStruct
  def placed_between?(start_date, end_date)
    placed_at >= start_date && placed_at <= end_date
  end
end
```

Now `order` handles the nuances of comparing dates and the internal details of this comparison don't leak out into code consuming it. This code better follows *tell-dont-ask* becuase `order` itself tells us whether it's in between two dates. What's more, in `orders_within_range()`, we don't ask `order` about its internal state anymore.

## Data Clump

Now there's another code smell. `start_date` and `end_date` form a *data clump*. A data clump is when two or more pieces of information always appear together and are in some way dependent on each other. Another way to think about the idea is that, if one piece of information were removed, would the result be useful or even make sense? Does `start_date` make sense on its own?

We can create a new class `DateRange` to store this data clump and to make the mutual dependency between `start_date` and `end_date` explicit to readers.

```ruby {hl_lines=[7, 18, "22-23", "26-29"]}
require 'date'
require 'ostruct'

class OrdersReport
  def initialize(orders, date_range)
    @orders = orders
    @date_range = date_range
  end

  def total_sales_within_date_range
    orders_within_range.
      map(&:amount).inject(0) { |sum, amount| amount + sum }
  end

  private

  def orders_within_range
    @orders.select { |order| order.placed_between?(@date_range) }
  end
end

class DateRange < Struct.new(:start_date, :end_date)
end

class Order < OpenStruct
  def placed_between?(date_range)
    placed_at >= date_range.start_date &&
    placed_at <= date_range.end_date
  end
end
```

Is this change worth it? Bob Martin says that

> Intermediate object oriented programmers are too reluctant to extract classes.

We should be aggressive, according to Bob Martin, about extracting classes because of the clarity that such refactors produce. That is to say, it's worth it to make the relationship between `start_date` and `end_date` explicit.

## Coupling

There are two more concrete reasons that make the above refactor worthwhile. First, we've made our code less *coupled*. Coupling occurs when changing one piece of software requires you to change another. In other words, when two components are coupled, it's hard to change one component without breaking the other. Low coupling is good because it makes it easier for maintainers to respond to change.

In the above refactor, we reduced *parameter coupling*. The argument here is that functions that have more arguments are worse than functions that have fewer. The reason for this is that, for every additional parameter, we introduce another bit of potential coupling. In other words, we make it easier for a caller to accidentally cause our function to "blow up." By reducing the number of arguments required above from three to two, we reduce this potential coupling.

## Cleaning Up

The second reason the above refactor is worthwhile is that it creates an ideal place for us hang new behavior. This insight leads us to another refactor.

```ruby {hl_lines=["23-25", 30]}
require 'date'
require 'ostruct'

class OrdersReport
  def initialize(orders, date_range)
    @orders = orders
    @date_range = date_range
  end

  def total_sales_within_date_range
    orders_within_range.
	  map(&:amount).inject(0) { |sum, amount| amount + sum }
  end

  private

  def orders_within_range
    @orders.select { |order| order.placed_between?(@date_range) }
  end
end

class DateRange < Struct.new(:start_date, :end_date)
  def include?(date)
    date >= self.start_date && date <= self.end_date
  end
end

class Order < OpenStruct
  def placed_between?(date_range)
    date_range.include?(self.placed_at)
  end
end
```

It makes more sense for `DateRange` to do the date comparison than for `order` to do it, since `DateRange` is intrinsically concerned with dates and their comparisons. `DateRange` is also now more useful and more likely to be reused. Moreover, concerns are now clearly separated across modules and the concerns of each module make sense.

## Depend Upon Abstractions

Consider the following code, which is concerned with charging customers. `BraintreeGem` is a payment provider.

```ruby
class User
  SUBSCRIPTION_AMOUNT = 10.to_money

  def charge_for_subscription
    braintree_id = BraintreeGem.find_user(email).braintree_id
    BraintreeGem.charge(braintree_id, SUBSCRIPTION_AMOUNT)
  end

  def create_as_customer
    BraintreeGem.create_customer(email)
  end
end

class Refund
  def process!
    transaction_id = BraintreeGem.find_transaction(order.braintree_id)
    BraintreeGem.refund(transaction_id, amount)
  end
end
```

This code is decent, but what if we switch payment providers? To do that, I'd need to do "shotgun surgery," where I'd have to open up many files and change every case where `BraintreeGem` is used. This is bad because it's labor intensive and error prone. It would be better if I could change `BraintreeGem` in one place and everything would still work.

What if I don't think it's likely for my payment provider to change? Keep in mind that any software dependency can change and their APIs can change. It's worthwhile to guard against such possibilities.

Here's another way of writing the code above.

```ruby
class User
  def charge_for_subscription
    PaymentGateway.new.charge_for_subscription(self)
  end

  def create_as_customer
    PaymentGateway.new.create_customer(self)
  end
end

class Refund
  def process!
    PaymentGateway.new.refund(self)
  end
end

# lib/payment_gateway.rb
class PaymentGateway
  SUBSCRIPTION_AMOUNT = 10.to_money

  def initialize(gateway = BraintreeGem)
    @gateway = gateway
  end

  def charge_for_subscription(user)
    braintree_id = @gateway.find_user(user.email).braintree_id
    @gateway.charge(braintree_id, SUBSCRIPTION_AMOUNT)
  end

  def create_customer(user)
    @gateway.create_customer(user.email)
  end

  def refund(refund_model)
    transaction_id = @gateway.find_transaction(order.braintree_id)
    @gateway.refund(transaction_id, order.amount)
  end
end
```

There's a number advantages to the above refactor.

- My business logic only knows about `PaymendGateway` and we're not directly dependent on third-party code.
- If I change payment providers from `BraintreeGem`, all I need to do is update `PaymentGateway`. I don't need to do "shotgun surgery."
- Testing is improved. I only need to test my code that depends on `PaymentGateway` which is easier to stub. I don't test my dependencies.

In my opinion, these advantages make the idea of depnding on abstractions the most important lesson.
