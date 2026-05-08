package model

import (
	"errors"
	"fmt"
	"math"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"gorm.io/gorm"
)

const (
	AffiliateWithdrawalStatusPending  = "pending"
	AffiliateWithdrawalStatusApproved = "approved"
	AffiliateWithdrawalStatusRejected = "rejected"
	AffiliateWithdrawalStatusPaid     = "paid"
)

type AffiliateWithdrawal struct {
	Id          int    `json:"id"`
	UserId      int    `json:"user_id" gorm:"index"`
	Amount      int    `json:"amount" gorm:"type:int;not null"`
	Status      string `json:"status" gorm:"type:varchar(32);index"`
	AccountType string `json:"account_type" gorm:"type:varchar(64)"`
	AccountNo   string `json:"account_no" gorm:"type:varchar(255)"`
	AccountName string `json:"account_name" gorm:"type:varchar(255)"`
	Note        string `json:"note" gorm:"type:text"`
	ReviewNote  string `json:"review_note" gorm:"type:text"`
	ReviewerId  int    `json:"reviewer_id" gorm:"type:int;default:0"`
	ProcessedAt int64  `json:"processed_at" gorm:"type:bigint;default:0"`
	CreatedAt   int64  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   int64  `json:"updated_at" gorm:"autoUpdateTime"`
}

type AffiliateCommissionRecord struct {
	Id                           int     `json:"id"`
	UserId                       int     `json:"user_id" gorm:"index"`
	InviterId                    int     `json:"inviter_id" gorm:"index"`
	TopUpId                      int     `json:"top_up_id" gorm:"index"`
	TradeNo                      string  `json:"trade_no" gorm:"type:varchar(255);uniqueIndex"`
	TopUpQuota                   int     `json:"top_up_quota" gorm:"type:int;not null"`
	CommissionQuota              int     `json:"commission_quota" gorm:"type:int;not null"`
	CommissionPercentageSnapshot float64 `json:"commission_percentage_snapshot" gorm:"type:decimal(10,4);not null"`
	CreatedAt                    int64   `json:"created_at" gorm:"autoCreateTime"`
}

type AffiliateInviteRelation struct {
	InviterId          int    `json:"inviter_id"`
	InviterUsername    string `json:"inviter_username"`
	InviterDisplayName string `json:"inviter_display_name"`
	InviteeId          int    `json:"invitee_id"`
	InviteeUsername    string `json:"invitee_username"`
	InviteeDisplayName string `json:"invitee_display_name"`
	InviteeEmail       string `json:"invitee_email"`
	CreatedAt          int64  `json:"created_at"`
}

type AdminAffiliateCommissionRecord struct {
	Id                           int     `json:"id"`
	UserId                       int     `json:"user_id"`
	UserUsername                 string  `json:"user_username"`
	UserDisplayName              string  `json:"user_display_name"`
	InviterId                    int     `json:"inviter_id"`
	InviterUsername              string  `json:"inviter_username"`
	InviterDisplayName           string  `json:"inviter_display_name"`
	TopUpId                      int     `json:"top_up_id"`
	TradeNo                      string  `json:"trade_no"`
	TopUpQuota                   int     `json:"top_up_quota"`
	CommissionQuota              int     `json:"commission_quota"`
	CommissionPercentageSnapshot float64 `json:"commission_percentage_snapshot"`
	CreatedAt                    int64   `json:"created_at"`
}

type AffiliateSummary struct {
	AffCode                       string                           `json:"aff_code"`
	AffCount                      int                              `json:"aff_count"`
	AffQuota                      int                              `json:"aff_quota"`
	AffHistoryQuota               int                              `json:"aff_history_quota"`
	AffiliateCommissionPercentage float64                          `json:"affiliate_commission_percentage"`
	AffiliateCommissionTiers      []common.AffiliateCommissionTier `json:"affiliate_commission_tiers"`
	CurrentAffiliateTier          common.AffiliateCommissionTier   `json:"current_affiliate_tier"`
	NextAffiliateTier             *common.AffiliateCommissionTier  `json:"next_affiliate_tier,omitempty"`
	CurrentAffiliateLevel         int                              `json:"current_affiliate_level"`
	RemainingInvitesForNextLevel  int                              `json:"remaining_invites_for_next_level"`
	AffiliateTransferEnabled      bool                             `json:"affiliate_transfer_enabled"`
	AffiliateWithdrawEnabled      bool                             `json:"affiliate_withdraw_enabled"`
	AffiliateMinWithdrawQuota     int                              `json:"affiliate_min_withdraw_quota"`
	AffiliateWithdrawNotice       string                           `json:"affiliate_withdraw_notice"`
}

func ensureAffiliateCode(user *User) error {
	if user.AffCode != "" {
		return nil
	}
	user.AffCode = common.GetRandomString(4)
	return DB.Model(user).Update("aff_code", user.AffCode).Error
}

func GetAffiliateSummary(userId int) (*AffiliateSummary, error) {
	user, err := GetUserById(userId, true)
	if err != nil {
		return nil, err
	}
	if err := ensureAffiliateCode(user); err != nil {
		return nil, err
	}
	currentTier := common.GetAffiliateCommissionTierByInviteCount(user.AffCount)
	nextTier, hasNextTier := common.GetNextAffiliateCommissionTier(user.AffCount)
	remainingInvites := 0
	if hasNextTier && nextTier.MinInvites > user.AffCount {
		remainingInvites = nextTier.MinInvites - user.AffCount
	}

	summary := &AffiliateSummary{
		AffCode:                       user.AffCode,
		AffCount:                      user.AffCount,
		AffQuota:                      user.AffQuota,
		AffHistoryQuota:               user.AffHistoryQuota,
		AffiliateCommissionPercentage: currentTier.Percentage,
		AffiliateCommissionTiers:      common.GetAffiliateCommissionTiersCopy(),
		CurrentAffiliateTier:          currentTier,
		CurrentAffiliateLevel:         currentTier.Level,
		RemainingInvitesForNextLevel:  remainingInvites,
		AffiliateTransferEnabled:      common.AffiliateTransferEnabled,
		AffiliateWithdrawEnabled:      common.AffiliateWithdrawEnabled,
		AffiliateMinWithdrawQuota:     common.AffiliateMinWithdrawQuota,
		AffiliateWithdrawNotice:       getAffiliateWithdrawNotice(),
	}
	if hasNextTier {
		summary.NextAffiliateTier = &nextTier
	}
	return summary, nil
}

func getAffiliateWithdrawNotice() string {
	common.OptionMapRWMutex.RLock()
	defer common.OptionMapRWMutex.RUnlock()
	return strings.TrimSpace(common.OptionMap["AffiliateWithdrawNotice"])
}

func calculateTopUpQuota(topUp *TopUp) int {
	if topUp == nil {
		return 0
	}
	if topUp.PaymentProvider == PaymentProviderCreem {
		return int(topUp.Amount)
	}
	if topUp.PaymentProvider == PaymentProviderStripe {
		if topUp.Money <= 0 {
			return 0
		}
		unitPrice := setting.StripeUnitPrice
		if unitPrice <= 0 {
			unitPrice = 1
		}
		usdAmount := topUp.Money / unitPrice
		return int(math.Floor(usdAmount * common.QuotaPerUnit))
	}
	if topUp.PaymentProvider == PaymentProviderWaffo {
		if topUp.Money <= 0 {
			return 0
		}
		unitPrice := setting.WaffoUnitPrice
		if unitPrice <= 0 {
			unitPrice = 1
		}
		usdAmount := topUp.Money / unitPrice
		return int(math.Floor(usdAmount * common.QuotaPerUnit))
	}
	if topUp.PaymentProvider == PaymentProviderWaffoPancake {
		if topUp.Money <= 0 {
			return 0
		}
		unitPrice := setting.WaffoPancakeUnitPrice
		if unitPrice <= 0 {
			unitPrice = 1
		}
		usdAmount := topUp.Money / unitPrice
		return int(math.Floor(usdAmount * common.QuotaPerUnit))
	}
	if topUp.PaymentProvider == PaymentProviderEpay || topUp.PaymentProvider == "" {
		if topUp.Money > 0 {
			unitPrice := operation_setting.Price
			if unitPrice <= 0 {
				unitPrice = 1
			}
			usdAmount := topUp.Money / unitPrice
			return int(math.Floor(usdAmount * common.QuotaPerUnit))
		}
	}
	if operation_setting.GetQuotaDisplayType() == operation_setting.QuotaDisplayTypeTokens {
		return int(topUp.Amount)
	}
	return int(math.Floor(float64(topUp.Amount) * common.QuotaPerUnit))
}

func ApplyAffiliateCommission(tx *gorm.DB, userId int, quotaToAdd int) (int, int, float64, error) {
	if tx == nil {
		return 0, 0, 0, errors.New("tx is nil")
	}
	if quotaToAdd <= 0 || common.GetMaxAffiliateCommissionPercentage() <= 0 {
		return 0, 0, 0, nil
	}

	var user User
	if err := tx.Select("id", "inviter_id").Where("id = ?", userId).First(&user).Error; err != nil {
		return 0, 0, 0, err
	}
	if user.InviterId == 0 || user.InviterId == user.Id {
		return 0, 0, 0, nil
	}

	var inviter User
	if err := tx.Select("id", "aff_count").Where("id = ?", user.InviterId).First(&inviter).Error; err != nil {
		return 0, 0, 0, err
	}

	commissionPercentage := common.GetAffiliateCommissionPercentageByInviteCount(inviter.AffCount)
	if commissionPercentage <= 0 {
		return 0, 0, 0, nil
	}

	commissionQuota := int(math.Floor(float64(quotaToAdd) * commissionPercentage / 100))
	if commissionQuota <= 0 {
		return 0, 0, 0, nil
	}

	if err := tx.Model(&User{}).Where("id = ?", user.InviterId).Updates(map[string]interface{}{
		"aff_quota":   gorm.Expr("aff_quota + ?", commissionQuota),
		"aff_history": gorm.Expr("aff_history + ?", commissionQuota),
	}).Error; err != nil {
		return 0, 0, 0, err
	}

	return user.InviterId, commissionQuota, commissionPercentage, nil
}

func settleAffiliateCommissionByTradeNo(tradeNo string, quotaToAddOverride *int) (*AffiliateCommissionRecord, error) {
	if strings.TrimSpace(tradeNo) == "" || common.GetMaxAffiliateCommissionPercentage() <= 0 {
		return nil, nil
	}

	var created *AffiliateCommissionRecord
	err := DB.Transaction(func(tx *gorm.DB) error {
		topUp := &TopUp{}
		refCol := "`trade_no`"
		if common.UsingPostgreSQL {
			refCol = `"trade_no"`
		}
		if err := tx.Set("gorm:query_option", "FOR UPDATE").Where(refCol+" = ?", tradeNo).First(topUp).Error; err != nil {
			return err
		}
		if topUp.Status != common.TopUpStatusSuccess {
			return nil
		}

		existing := &AffiliateCommissionRecord{}
		if err := tx.Where("trade_no = ?", tradeNo).First(existing).Error; err == nil {
			created = existing
			return nil
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		quotaToAdd := calculateTopUpQuota(topUp)
		if quotaToAddOverride != nil && *quotaToAddOverride > 0 {
			quotaToAdd = *quotaToAddOverride
		}
		if quotaToAdd <= 0 {
			return nil
		}

		inviterId, commissionQuota, commissionPercentage, err := ApplyAffiliateCommission(tx, topUp.UserId, quotaToAdd)
		if err != nil {
			return err
		}
		if inviterId == 0 || commissionQuota <= 0 {
			return nil
		}

		record := &AffiliateCommissionRecord{
			UserId:                       topUp.UserId,
			InviterId:                    inviterId,
			TopUpId:                      topUp.Id,
			TradeNo:                      topUp.TradeNo,
			TopUpQuota:                   quotaToAdd,
			CommissionQuota:              commissionQuota,
			CommissionPercentageSnapshot: commissionPercentage,
		}
		if err := tx.Create(record).Error; err != nil {
			return err
		}
		created = record
		return nil
	})
	if err != nil {
		return nil, err
	}
	if created != nil && created.Id != 0 {
		RecordLog(created.InviterId, LogTypeSystem, fmt.Sprintf("affiliate commission settled: %s from user %d", logger.LogQuota(created.CommissionQuota), created.UserId))
	}
	return created, nil
}

func SettleAffiliateCommissionByTradeNo(tradeNo string) (*AffiliateCommissionRecord, error) {
	return settleAffiliateCommissionByTradeNo(tradeNo, nil)
}

func SettleAffiliateCommissionByTradeNoWithPayMoney(tradeNo string, actualPayMoney float64) (*AffiliateCommissionRecord, error) {
	if actualPayMoney <= 0 {
		return settleAffiliateCommissionByTradeNo(tradeNo, nil)
	}
	topUp := GetTopUpByTradeNo(tradeNo)
	if topUp == nil {
		return settleAffiliateCommissionByTradeNo(tradeNo, nil)
	}
	moneyBackup := topUp.Money
	topUp.Money = actualPayMoney
	quotaToAdd := calculateTopUpQuota(topUp)
	topUp.Money = moneyBackup
	if quotaToAdd <= 0 {
		return settleAffiliateCommissionByTradeNo(tradeNo, nil)
	}
	return settleAffiliateCommissionByTradeNo(tradeNo, &quotaToAdd)
}

func GetUserAffiliateCommissionRecords(userId int, pageInfo *common.PageInfo) ([]*AffiliateCommissionRecord, int64, error) {
	var items []*AffiliateCommissionRecord
	var total int64
	tx := DB.Model(&AffiliateCommissionRecord{}).Where("inviter_id = ?", userId)
	if err := tx.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := tx.Order("id desc").Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func GetAffiliateInvitees(userId int, pageInfo *common.PageInfo) ([]*AffiliateInviteRelation, int64, error) {
	var items []*AffiliateInviteRelation
	var total int64

	tx := DB.Table("users AS invitee").
		Select(`
			invitee.id AS invitee_id,
			invitee.username AS invitee_username,
			invitee.display_name AS invitee_display_name,
			invitee.email AS invitee_email,
			invitee.created_at AS created_at,
			inviter.id AS inviter_id,
			inviter.username AS inviter_username,
			inviter.display_name AS inviter_display_name
		`).
		Joins("LEFT JOIN users AS inviter ON inviter.id = invitee.inviter_id").
		Where("invitee.inviter_id = ?", userId)

	if err := tx.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := tx.Order("invitee.id desc").Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Scan(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func GetAdminAffiliateInviteRelations(pageInfo *common.PageInfo, keyword string) ([]*AffiliateInviteRelation, int64, error) {
	var items []*AffiliateInviteRelation
	var total int64

	tx := DB.Table("users AS invitee").
		Select(`
			invitee.id AS invitee_id,
			invitee.username AS invitee_username,
			invitee.display_name AS invitee_display_name,
			invitee.email AS invitee_email,
			invitee.created_at AS created_at,
			inviter.id AS inviter_id,
			inviter.username AS inviter_username,
			inviter.display_name AS inviter_display_name
		`).
		Joins("LEFT JOIN users AS inviter ON inviter.id = invitee.inviter_id").
		Where("invitee.inviter_id > 0")

	if strings.TrimSpace(keyword) != "" {
		pattern := "%" + strings.TrimSpace(keyword) + "%"
		tx = tx.Where(
			"invitee.username LIKE ? OR invitee.display_name LIKE ? OR invitee.email LIKE ? OR inviter.username LIKE ? OR inviter.display_name LIKE ?",
			pattern, pattern, pattern, pattern, pattern,
		)
	}

	if err := tx.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := tx.Order("invitee.id desc").Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Scan(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func GetAdminAffiliateCommissionRecords(pageInfo *common.PageInfo, keyword string) ([]*AdminAffiliateCommissionRecord, int64, error) {
	var items []*AdminAffiliateCommissionRecord
	var total int64

	tx := DB.Table("affiliate_commission_records AS record").
		Select(`
			record.id AS id,
			record.user_id AS user_id,
			invitee.username AS user_username,
			invitee.display_name AS user_display_name,
			record.inviter_id AS inviter_id,
			inviter.username AS inviter_username,
			inviter.display_name AS inviter_display_name,
			record.top_up_id AS top_up_id,
			record.trade_no AS trade_no,
			record.top_up_quota AS top_up_quota,
			record.commission_quota AS commission_quota,
			record.commission_percentage_snapshot AS commission_percentage_snapshot,
			record.created_at AS created_at
		`).
		Joins("LEFT JOIN users AS invitee ON invitee.id = record.user_id").
		Joins("LEFT JOIN users AS inviter ON inviter.id = record.inviter_id")

	if strings.TrimSpace(keyword) != "" {
		pattern := "%" + strings.TrimSpace(keyword) + "%"
		tx = tx.Where(
			"record.trade_no LIKE ? OR invitee.username LIKE ? OR invitee.display_name LIKE ? OR inviter.username LIKE ? OR inviter.display_name LIKE ?",
			pattern, pattern, pattern, pattern, pattern,
		)
	}

	if err := tx.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := tx.Order("record.id desc").Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Scan(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func CreateAffiliateWithdrawal(userId int, amount int, accountType string, accountNo string, accountName string, note string) (*AffiliateWithdrawal, error) {
	if !common.AffiliateWithdrawEnabled {
		return nil, errors.New("affiliate withdrawal is disabled")
	}
	if amount <= 0 {
		return nil, errors.New("withdrawal amount must be greater than zero")
	}
	if amount < common.AffiliateMinWithdrawQuota {
		return nil, fmt.Errorf("minimum withdrawal is %s", logger.LogQuota(common.AffiliateMinWithdrawQuota))
	}
	normalizedAccountType, err := normalizeAffiliateWithdrawalAccountType(accountType)
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(accountNo) == "" {
		return nil, errors.New("withdrawal account is required")
	}

	withdrawal := &AffiliateWithdrawal{}
	err = DB.Transaction(func(tx *gorm.DB) error {
		user := &User{}
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(user, userId).Error; err != nil {
			return err
		}
		if user.AffQuota < amount {
			return errors.New("affiliate quota is insufficient")
		}

		user.AffQuota -= amount
		if err := tx.Save(user).Error; err != nil {
			return err
		}

		withdrawal.UserId = userId
		withdrawal.Amount = amount
		withdrawal.Status = AffiliateWithdrawalStatusPending
		withdrawal.AccountType = normalizedAccountType
		withdrawal.AccountNo = strings.TrimSpace(accountNo)
		withdrawal.AccountName = strings.TrimSpace(accountName)
		withdrawal.Note = strings.TrimSpace(note)
		return tx.Create(withdrawal).Error
	})
	if err != nil {
		return nil, err
	}

	RecordLog(userId, LogTypeSystem, fmt.Sprintf("affiliate withdrawal requested: %s", logger.LogQuota(amount)))
	return withdrawal, nil
}

func normalizeAffiliateWithdrawalAccountType(accountType string) (string, error) {
	trimmed := strings.TrimSpace(accountType)
	normalized := strings.ToLower(trimmed)
	if normalized == "alipay" || trimmed == "支付宝" {
		return "alipay", nil
	}
	return "", errors.New("only Alipay withdrawals are supported")
}

func GetUserAffiliateWithdrawals(userId int, pageInfo *common.PageInfo) ([]*AffiliateWithdrawal, int64, error) {
	var withdrawals []*AffiliateWithdrawal
	var total int64
	tx := DB.Model(&AffiliateWithdrawal{}).Where("user_id = ?", userId)
	if err := tx.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := tx.Order("id desc").Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Find(&withdrawals).Error; err != nil {
		return nil, 0, err
	}
	return withdrawals, total, nil
}

func GetAffiliateWithdrawals(pageInfo *common.PageInfo, status string, keyword string) ([]*AffiliateWithdrawal, int64, error) {
	var withdrawals []*AffiliateWithdrawal
	var total int64

	tx := DB.Model(&AffiliateWithdrawal{})
	if strings.TrimSpace(status) != "" {
		tx = tx.Where("status = ?", strings.TrimSpace(status))
	}
	if strings.TrimSpace(keyword) != "" {
		pattern := "%" + strings.TrimSpace(keyword) + "%"
		tx = tx.Where("account_type LIKE ? OR account_no LIKE ? OR account_name LIKE ?", pattern, pattern, pattern)
	}

	if err := tx.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := tx.Order("id desc").Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Find(&withdrawals).Error; err != nil {
		return nil, 0, err
	}
	return withdrawals, total, nil
}

func ReviewAffiliateWithdrawal(withdrawalId int, reviewerId int, status string, reviewNote string) (*AffiliateWithdrawal, error) {
	status = strings.TrimSpace(status)
	switch status {
	case AffiliateWithdrawalStatusApproved, AffiliateWithdrawalStatusRejected, AffiliateWithdrawalStatusPaid:
	default:
		return nil, errors.New("invalid withdrawal status")
	}

	var withdrawal AffiliateWithdrawal
	err := DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&withdrawal, withdrawalId).Error; err != nil {
			return err
		}
		if withdrawal.Status == AffiliateWithdrawalStatusRejected || withdrawal.Status == AffiliateWithdrawalStatusPaid {
			return errors.New("withdrawal already finalized")
		}

		if status == AffiliateWithdrawalStatusRejected {
			if err := tx.Model(&User{}).Where("id = ?", withdrawal.UserId).Update("aff_quota", gorm.Expr("aff_quota + ?", withdrawal.Amount)).Error; err != nil {
				return err
			}
		}

		withdrawal.Status = status
		withdrawal.ReviewerId = reviewerId
		withdrawal.ReviewNote = strings.TrimSpace(reviewNote)
		withdrawal.ProcessedAt = common.GetTimestamp()
		return tx.Save(&withdrawal).Error
	})
	if err != nil {
		return nil, err
	}

	RecordLog(withdrawal.UserId, LogTypeSystem, fmt.Sprintf("affiliate withdrawal status updated: %s", withdrawal.Status))
	return &withdrawal, nil
}
